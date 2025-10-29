'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const modelFromUrl = searchParams.get('model');
  const tabFromUrl = searchParams.get('tab');
  const [selectedPlatform, setSelectedPlatform] = useState<string>(modelFromUrl || 'openai');
  const [activeTab, setActiveTab] = useState<'image' | 'video'>((tabFromUrl as 'image' | 'video') || 'image');

  // URL 파라미터가 변경될 때마다 선택된 플랫폼과 탭 업데이트
  useEffect(() => {
    if (modelFromUrl) {
      setSelectedPlatform(modelFromUrl);
    }
    if (tabFromUrl && (tabFromUrl === 'image' || tabFromUrl === 'video')) {
      setActiveTab(tabFromUrl);
    }
  }, [modelFromUrl, tabFromUrl]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [requestBody, setRequestBody] = useState<any>(null);

  // OpenAI
  const [openaiAction, setOpenaiAction] = useState<'chat' | 'image'>('chat');
  const [openaiPrompt, setOpenaiPrompt] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4');

  // Gemini
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-pro');

  // Kling
  const [klingPrompt, setKlingPrompt] = useState('');
  const [klingDuration, setKlingDuration] = useState(5);

  // Seedream
  const [seedreamPrompt, setSeedreamPrompt] = useState('');
  const [seedreamModel, setSeedreamModel] = useState('seedream-4-0-250828');
  const [seedreamAspectRatio, setSeedreamAspectRatio] = useState('1:1');
  const [seedreamResponseFormat, setSeedreamResponseFormat] = useState('url');
  const [seedreamWatermark, setSeedreamWatermark] = useState(true);
  const [seedreamSequentialGeneration, setSeedreamSequentialGeneration] = useState('disabled');
  const [seedreamReferenceImages, setSeedreamReferenceImages] = useState<string[]>([]);

  // Veo
  const [veoPrompt, setVeoPrompt] = useState('');
  const [veoDuration, setVeoDuration] = useState(10);

  // 작품 저장 함수
  const saveArtwork = (result: any, prompt: string, platform: string) => {
    if (!result.success) return;

    const artwork = {
      id: Date.now().toString(),
      title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
      type: selectedPlatform === 'kling' || selectedPlatform === 'veo' ? 'video' : 'image',
      platform: platform,
      prompt: prompt,
      createdAt: new Date().toISOString(),
      imageUrl: result.data?.data?.[0]?.url || result.data?.url,
      videoUrl: result.data?.data?.[0]?.url || result.data?.url,
    };

    // 로컬 스토리지에서 기존 작품들 불러오기
    const existingArtworks = JSON.parse(localStorage.getItem('ai-artworks') || '[]');
    
    // 새 작품을 맨 앞에 추가
    const updatedArtworks = [artwork, ...existingArtworks];
    
    // 최대 50개까지만 저장
    if (updatedArtworks.length > 50) {
      updatedArtworks.splice(50);
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem('ai-artworks', JSON.stringify(updatedArtworks));
    
    console.log('✅ 작품이 저장되었습니다:', artwork.title);
  };

  // 참조 이미지 URL 추가
  const handleAddImageUrl = () => {
    if (seedreamReferenceImages.length >= 10) {
      alert('최대 10개의 참조 이미지만 추가할 수 있습니다.');
      return;
    }
    setSeedreamReferenceImages((prev) => [...prev, '']);
  };

  // 참조 이미지 URL 업데이트
  const handleImageUrlChange = (index: number, url: string) => {
    setSeedreamReferenceImages((prev) => {
      const newUrls = [...prev];
      newUrls[index] = url;
      return newUrls;
    });
  };

  // 참조 이미지 제거 함수
  const removeReferenceImage = (index: number) => {
    setSeedreamReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 이미지 파일 업로드 처리
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (seedreamReferenceImages.length + files.length > 10) {
      alert('최대 10개의 참조 이미지만 업로드할 수 있습니다.');
      return;
    }

    try {
      for (const file of Array.from(files)) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          alert(`${file.name}: 지원되지 않는 형식입니다. (jpeg, png만 허용)`);
          continue;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(`${file.name}: 파일 크기가 10MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          continue;
        }

        const imageValidation = await new Promise<{ valid: boolean; message?: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const img = new Image();

            img.onload = () => {
              const width = img.width;
              const height = img.height;

              if (width <= 14 || height <= 14) {
                resolve({
                  valid: false,
                  message: `이미지가 너무 작습니다. (최소: 14x14px, 현재: ${width}x${height}px)`
                });
                return;
              }

              if (width > 6000 || height > 6000) {
                resolve({
                  valid: false,
                  message: `이미지가 너무 큽니다. (최대: 6000x6000px, 현재: ${width}x${height}px)`
                });
                return;
              }

              const aspectRatio = width / height;
              if (aspectRatio < 1/3 || aspectRatio > 3) {
                resolve({
                  valid: false,
                  message: `종횡비가 유효하지 않습니다. (허용 범위: 1:3 ~ 3:1, 현재: ${aspectRatio.toFixed(2)})`
                });
                return;
              }

              resolve({ valid: true });
            };

            img.onerror = () => {
              resolve({ valid: false, message: '이미지 로드 실패' });
            };

            img.src = dataUrl;
          };

          reader.onerror = () => {
            resolve({ valid: false, message: '파일 읽기 실패' });
          };

          reader.readAsDataURL(file);
        });

        if (!imageValidation.valid) {
          alert(`${file.name}: ${imageValidation.message}`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          alert(`${file.name}: 업로드 실패 - ${uploadResult.error}`);
          continue;
        }

        const publicUrl = uploadResult.url;
        setSeedreamReferenceImages((prev) => [...prev, publicUrl]);
        console.log(`✅ 이미지 업로드 완료: ${file.name} → ${publicUrl}`);
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }

    e.target.value = '';
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setRequestBody(null);

    try {
      let endpoint = '';
      let body: any = {};

      switch (selectedPlatform) {
        case 'openai':
          endpoint = '/api/platforms/openai';
          body = {
            action: openaiAction,
            prompt: openaiPrompt,
            model: openaiModel,
          };
          break;

        case 'gemini':
          endpoint = '/api/platforms/gemini';
          body = {
            action: 'text',
            prompt: geminiPrompt,
            model: geminiModel,
          };
          break;

        case 'kling':
          endpoint = '/api/platforms/kling';
          body = {
            action: 'video',
            prompt: klingPrompt,
            duration: klingDuration,
          };
          break;

        case 'seedream':
          endpoint = '/api/platforms/seedream';

          const resolutionMap: { [key: string]: { width: number; height: number } } = {
            '1:1': { width: 2048, height: 2048 },
            '4:3': { width: 2304, height: 1728 },
            '3:4': { width: 1728, height: 2304 },
            '16:9': { width: 2560, height: 1440 },
            '9:16': { width: 1440, height: 2560 },
            '3:2': { width: 2496, height: 1664 },
            '2:3': { width: 1664, height: 2496 },
            '21:9': { width: 3024, height: 1296 },
          };

          const resolution = resolutionMap[seedreamAspectRatio];

          body = {
            action: 'image',
            model: seedreamModel,
            prompt: seedreamPrompt,
            width: resolution.width,
            height: resolution.height,
            response_format: seedreamResponseFormat,
            watermark: seedreamWatermark,
            sequential_image_generation: seedreamSequentialGeneration,
          };

          const validImageUrls = seedreamReferenceImages.filter(url => url && url.trim() !== '');
          if (validImageUrls.length > 0) {
            body.image = validImageUrls;
            console.log(`📸 참조 이미지 ${validImageUrls.length}개 전송 중...`);
            console.log('이미지 URL:', validImageUrls);
          }
          setRequestBody(body);
          break;

        case 'veo':
          endpoint = '/api/platforms/veo';
          body = {
            action: 'video',
            prompt: veoPrompt,
            duration: veoDuration,
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
      
      // 성공한 경우 작품 저장
      if (data.success) {
        let prompt = '';
        switch (selectedPlatform) {
          case 'openai':
            prompt = openaiPrompt;
            break;
          case 'gemini':
            prompt = geminiPrompt;
            break;
          case 'kling':
            prompt = klingPrompt;
            break;
          case 'seedream':
            prompt = seedreamPrompt;
            break;
          case 'veo':
            prompt = veoPrompt;
            break;
        }
        
        if (prompt.trim()) {
          saveArtwork(data, prompt, selectedPlatform);
        }
      }
    } catch (error) {
      console.error('Failed to call API:', error);
      setResult({ success: false, error: 'Failed to call API' });
    } finally {
      setLoading(false);
    }
  };

  // 플랫폼별 탭 매핑
  const getPlatformTabs = () => {
    switch (selectedPlatform) {
      case 'openai':
        return openaiAction === 'image' ? ['image'] : ['image'];
      case 'gemini':
        return ['image'];
      case 'seedream':
        return ['image'];
      case 'kling':
      case 'veo':
        return ['video'];
      default:
        return ['image'];
    }
  };

  const availableTabs = getPlatformTabs();
  const currentTab = availableTabs.includes(activeTab) ? activeTab : availableTabs[0];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">AI Studio</h1>
            </div>
            <Link
              href="/landing"
              className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-12">
        <div className="space-y-8">
          {/* 1. 모델 선택 섹션 - 드롭다운으로 최소화 */}
          <section className="relative">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">Model</h2>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-black font-medium"
                >
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="seedream">Seedream 4.0</option>
                  <option value="kling">Kling AI</option>
                  <option value="veo">Google Veo 3.1</option>
                </select>
              </div>
            </div>
          </section>

          {/* 2. 참조 이미지 섹션 */}
          <section className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-black mb-2">Reference Images</h2>
              </div>

              {/* 이미지 업로드 영역 */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-black transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-6xl mb-4 text-gray-400">+</div>
                    <p className="text-gray-600 mb-2">Click to upload images</p>
                    <p className="text-sm text-gray-500">JPEG, PNG (max 10MB)</p>
                  </label>
                </div>
              </div>

              {/* 업로드된 이미지 그리드 - 꽉 차도록 수정 */}
              {seedreamReferenceImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-black mb-4">Uploaded Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {seedreamReferenceImages.map((url, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={url}
                          alt={`참조 이미지 ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeReferenceImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL 입력 섹션 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-black">Add Image URL</h3>
                  <button
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    + Add URL
                  </button>
                </div>
                
                {seedreamReferenceImages.map((url, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-black placeholder-gray-500"
                    />
                    <button
                      onClick={() => removeReferenceImage(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. 작업 탭 섹션 - 하나의 배너로 통합 */}
          <section className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-black mb-2">Create</h2>
              </div>

              {/* 탭 선택 */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 rounded-xl p-1">
                  {availableTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as 'image' | 'video')}
                      className={`px-8 py-4 rounded-lg transition-all duration-300 font-medium ${
                        currentTab === tab
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {tab === 'image' ? 'IMAGE' : 'VIDEO'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 설정 폼 */}
              <div className="max-w-2xl mx-auto">
                {selectedPlatform === 'openai' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-black font-medium mb-2">Action</label>
                      <select
                        value={openaiAction}
                        onChange={(e) => setOpenaiAction(e.target.value as 'chat' | 'image')}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black"
                      >
                        <option value="chat">Text Generation</option>
                        <option value="image">Image Generation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-black font-medium mb-2">Model</label>
                      <select
                        value={openaiModel}
                        onChange={(e) => setOpenaiModel(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="dall-e-3">DALL-E 3</option>
                        <option value="dall-e-2">DALL-E 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-black font-medium mb-2">Prompt</label>
                      <textarea
                        value={openaiPrompt}
                        onChange={(e) => setOpenaiPrompt(e.target.value)}
                        placeholder="Enter your prompt..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black placeholder-gray-500"
                      />
                    </div>
                  </div>
                )}

                {selectedPlatform === 'gemini' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-black font-medium mb-2">Model</label>
                      <select
                        value={geminiModel}
                        onChange={(e) => setGeminiModel(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black"
                      >
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="gemini-pro-vision">Gemini Pro Vision</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-black font-medium mb-2">Prompt</label>
                      <textarea
                        value={geminiPrompt}
                        onChange={(e) => setGeminiPrompt(e.target.value)}
                        placeholder="Enter your prompt..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black placeholder-gray-500"
                      />
                    </div>
                  </div>
                )}

                {selectedPlatform === 'seedream' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-black font-medium mb-2">Prompt</label>
                      <textarea
                        value={seedreamPrompt}
                        onChange={(e) => setSeedreamPrompt(e.target.value)}
                        placeholder="Describe the image you want to create..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black placeholder-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black font-medium mb-2">Model</label>
                        <select
                          value={seedreamModel}
                          onChange={(e) => setSeedreamModel(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="seedream-4-0-250828">Seedream 4.0</option>
                          <option value="ByteDance-Seed/Seedream-4.0">Seedream 4.0 Alt</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-black font-medium mb-2">Resolution</label>
                        <select
                          value={seedreamAspectRatio}
                          onChange={(e) => setSeedreamAspectRatio(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="1:1">1:1 (2048x2048)</option>
                          <option value="4:3">4:3 (2304x1728)</option>
                          <option value="3:4">3:4 (1728x2304)</option>
                          <option value="16:9">16:9 (2560x1440)</option>
                          <option value="9:16">9:16 (1440x2560)</option>
                          <option value="3:2">3:2 (2496x1664)</option>
                          <option value="2:3">2:3 (1664x2496)</option>
                          <option value="21:9">21:9 (3024x1296)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black font-medium mb-2">Response Format</label>
                        <select
                          value={seedreamResponseFormat}
                          onChange={(e) => setSeedreamResponseFormat(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="url">URL</option>
                          <option value="base64">Base64</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-black font-medium mb-2">Sequential Generation</label>
                        <select
                          value={seedreamSequentialGeneration}
                          onChange={(e) => setSeedreamSequentialGeneration(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="disabled">Disabled</option>
                          <option value="enabled">Enabled</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="seedream-watermark"
                        checked={seedreamWatermark}
                        onChange={(e) => setSeedreamWatermark(e.target.checked)}
                        className="w-5 h-5 text-black bg-gray-100 border-gray-300 rounded focus:ring-black"
                      />
                      <label htmlFor="seedream-watermark" className="ml-3 text-black font-medium">
                        Show Watermark
                      </label>
                    </div>
                  </div>
                )}

                {selectedPlatform === 'kling' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-black font-medium mb-2">Prompt</label>
                      <textarea
                        value={klingPrompt}
                        onChange={(e) => setKlingPrompt(e.target.value)}
                        placeholder="Describe the video you want to create..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-black font-medium mb-2">Duration (seconds)</label>
                      <select
                        value={klingDuration}
                        onChange={(e) => setKlingDuration(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black"
                      >
                        <option value={5}>5 seconds</option>
                        <option value={10}>10 seconds</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedPlatform === 'veo' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-black font-medium mb-2">Prompt</label>
                      <textarea
                        value={veoPrompt}
                        onChange={(e) => setVeoPrompt(e.target.value)}
                        placeholder="Describe the video you want to create..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-black font-medium mb-2">Duration (seconds)</label>
                      <input
                        type="number"
                        value={veoDuration}
                        onChange={(e) => setVeoDuration(Number(e.target.value))}
                        min={5}
                        max={60}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black"
                      />
                    </div>
                  </div>
                )}

                <div className="text-center mt-8">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {loading ? 'Creating...' : 'CREATE'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 결과물 섹션 */}
          {result && (
            <section className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-black mb-2">Result</h2>
                </div>

                <div className={`p-6 rounded-xl ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <span className={`text-lg font-semibold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✓ Created Successfully' : '✗ Creation Failed'}
                    </span>
                    {result.duration && (
                      <span className="text-gray-500 text-sm">
                        ({result.duration}ms)
                      </span>
                    )}
                  </div>

                  {!result.success && result.error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-medium mb-1">Error Details:</p>
                      <p className="text-red-600 text-sm">{result.error}</p>
                    </div>
                  )}

                  {selectedPlatform === 'seedream' && result.success && result.data?.data && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-black mb-4 text-center">Generated Images</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.data.data.map((image: any, index: number) => (
                          <div key={index} className="bg-gray-100 rounded-xl overflow-hidden">
                            <img
                              src={image.url || (image.b64_json ? `data:image/png;base64,${image.b64_json}` : '')}
                              alt={`Generated image ${index + 1}`}
                              className="w-full h-auto"
                            />
                            <div className="p-4 flex justify-between items-center">
                              <span className="text-gray-600 font-medium">Image {index + 1}</span>
                              <a
                                href={image.url || `data:image/png;base64,${image.b64_json}`}
                                download={`seedream-${Date.now()}-${index + 1}.png`}
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <details className="mt-6">
                    <summary className="cursor-pointer text-gray-600 text-sm hover:text-black mb-3 font-medium text-center">
                      View Full Response (JSON)
                    </summary>
                    <pre className="text-gray-700 text-sm overflow-x-auto bg-gray-100 p-4 rounded-lg border border-gray-300">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}