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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200">
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Platform Hub</h1>
              <p className="text-gray-600 text-lg">Transform your ideas into reality with AI</p>
            </div>
            <Link
              href="/landing"
              className="px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 rounded-xl hover:bg-white/30 transition-all duration-300 font-medium"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-12">
        <div className="space-y-8">
          {/* 1. 모델 선택 섹션 */}
          <section className="relative">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">모델 선택</h2>
                <p className="text-gray-600">AI 플랫폼을 선택하여 시작하세요</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'openai', name: 'OpenAI', icon: '🤖', description: 'GPT-4, DALL-E' },
                  { id: 'gemini', name: 'Google Gemini', icon: '✨', description: 'Gemini Pro' },
                  { id: 'seedream', name: 'Seedream 4.0', icon: '🖼️', description: '4K 이미지 생성' },
                  { id: 'kling', name: 'Kling AI', icon: '🎥', description: '비디오 생성' },
                  { id: 'veo', name: 'Google Veo 3.1', icon: '🎬', description: 'AI 비디오' },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-6 rounded-xl transition-all duration-300 ${
                      selectedPlatform === platform.id
                        ? 'bg-white/30 backdrop-blur-md border-2 border-blue-400 shadow-lg scale-105'
                        : 'bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/25 hover:scale-102'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{platform.icon}</div>
                      <h3 className="font-semibold text-gray-800 mb-1">{platform.name}</h3>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 2. 참조 이미지 섹션 */}
          <section className="relative">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">참조 이미지</h2>
                <p className="text-gray-600">원하는 스타일의 이미지를 업로드하세요</p>
              </div>

              {/* 이미지 업로드 영역 */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
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
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-gray-600 mb-2">클릭하여 이미지 업로드</p>
                    <p className="text-sm text-gray-500">JPEG, PNG (최대 10MB)</p>
                  </label>
                </div>
              </div>

              {/* 업로드된 이미지 그리드 */}
              {seedreamReferenceImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">업로드된 이미지</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {seedreamReferenceImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`참조 이미지 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-white/30"
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
                  <h3 className="text-lg font-medium text-gray-800">이미지 URL 추가</h3>
                  <button
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    + URL 추가
                  </button>
                </div>
                
                {seedreamReferenceImages.map((url, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800 placeholder-gray-500"
                    />
                    <button
                      onClick={() => removeReferenceImage(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. 설정 탭 섹션 */}
          <section className="relative">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">설정 탭</h2>
                <p className="text-gray-600">AI 모델의 세부 설정을 조정하세요</p>
              </div>

              {/* 탭 선택 */}
              <div className="flex justify-center mb-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1">
                  {availableTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as 'image' | 'video')}
                      className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                        currentTab === tab
                          ? 'bg-white/30 text-gray-800 font-medium'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {tab === 'image' ? '이미지 생성' : '비디오 생성'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 설정 폼 */}
              <div className="max-w-2xl mx-auto">
                {selectedPlatform === 'openai' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">액션</label>
                      <select
                        value={openaiAction}
                        onChange={(e) => setOpenaiAction(e.target.value as 'chat' | 'image')}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800"
                      >
                        <option value="chat">텍스트 생성 (Chat)</option>
                        <option value="image">이미지 생성 (DALL-E)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">모델</label>
                      <select
                        value={openaiModel}
                        onChange={(e) => setOpenaiModel(e.target.value)}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="dall-e-3">DALL-E 3</option>
                        <option value="dall-e-2">DALL-E 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">프롬프트</label>
                      <textarea
                        value={openaiPrompt}
                        onChange={(e) => setOpenaiPrompt(e.target.value)}
                        placeholder="프롬프트를 입력하세요..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800 placeholder-gray-500"
                      />
                    </div>
                  </div>
                )}

                {selectedPlatform === 'gemini' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">모델</label>
                      <select
                        value={geminiModel}
                        onChange={(e) => setGeminiModel(e.target.value)}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800"
                      >
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="gemini-pro-vision">Gemini Pro Vision</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">프롬프트</label>
                      <textarea
                        value={geminiPrompt}
                        onChange={(e) => setGeminiPrompt(e.target.value)}
                        placeholder="프롬프트를 입력하세요..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800 placeholder-gray-500"
                      />
                    </div>
                  </div>
                )}

                {selectedPlatform === 'seedream' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">프롬프트</label>
                      <textarea
                        value={seedreamPrompt}
                        onChange={(e) => setSeedreamPrompt(e.target.value)}
                        placeholder="이미지 설명을 입력하세요..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800 placeholder-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">모델</label>
                        <select
                          value={seedreamModel}
                          onChange={(e) => setSeedreamModel(e.target.value)}
                          className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800"
                        >
                          <option value="seedream-4-0-250828">Seedream 4.0 (250828)</option>
                          <option value="ByteDance-Seed/Seedream-4.0">Seedream 4.0 (Alt)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">해상도</label>
                        <select
                          value={seedreamAspectRatio}
                          onChange={(e) => setSeedreamAspectRatio(e.target.value)}
                          className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800"
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
                        <label className="block text-gray-700 font-medium mb-2">응답 형식</label>
                        <select
                          value={seedreamResponseFormat}
                          onChange={(e) => setSeedreamResponseFormat(e.target.value)}
                          className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800"
                        >
                          <option value="url">URL</option>
                          <option value="base64">Base64</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">순차 생성</label>
                        <select
                          value={seedreamSequentialGeneration}
                          onChange={(e) => setSeedreamSequentialGeneration(e.target.value)}
                          className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800"
                        >
                          <option value="disabled">비활성화 (동시 생성)</option>
                          <option value="enabled">활성화 (순차 생성)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="seedream-watermark"
                        checked={seedreamWatermark}
                        onChange={(e) => setSeedreamWatermark(e.target.checked)}
                        className="w-5 h-5 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="seedream-watermark" className="ml-3 text-gray-700 font-medium">
                        워터마크 표시
                      </label>
                    </div>
                  </div>
                )}

                {selectedPlatform === 'kling' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">프롬프트</label>
                      <textarea
                        value={klingPrompt}
                        onChange={(e) => setKlingPrompt(e.target.value)}
                        placeholder="비디오 설명을 입력하세요..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">길이 (초)</label>
                      <select
                        value={klingDuration}
                        onChange={(e) => setKlingDuration(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800"
                      >
                        <option value={5}>5초</option>
                        <option value={10}>10초</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedPlatform === 'veo' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">프롬프트</label>
                      <textarea
                        value={veoPrompt}
                        onChange={(e) => setVeoPrompt(e.target.value)}
                        placeholder="비디오 설명을 입력하세요..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">길이 (초)</label>
                      <input
                        type="number"
                        value={veoDuration}
                        onChange={(e) => setVeoDuration(Number(e.target.value))}
                        min={5}
                        max={60}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-800"
                      />
                    </div>
                  </div>
                )}

                <div className="text-center mt-8">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {loading ? '처리 중...' : '생성 시작'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 결과물 섹션 */}
          {result && (
            <section className="relative">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">결과 이미지</h2>
                  <p className="text-gray-600">AI가 생성한 결과물입니다</p>
                </div>

                <div className={`p-6 rounded-xl ${result.success ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <span className={`text-lg font-semibold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✅ 생성 완료' : '❌ 생성 실패'}
                    </span>
                    {result.duration && (
                      <span className="text-gray-500 text-sm">
                        ({result.duration}ms)
                      </span>
                    )}
                  </div>

                  {!result.success && result.error && (
                    <div className="mb-6 p-4 bg-red-100/50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-medium mb-1">오류 상세:</p>
                      <p className="text-red-600 text-sm">{result.error}</p>
                    </div>
                  )}

                  {selectedPlatform === 'seedream' && result.success && result.data?.data && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">생성된 이미지</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.data.data.map((image: any, index: number) => (
                          <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden border border-white/30">
                            <img
                              src={image.url || (image.b64_json ? `data:image/png;base64,${image.b64_json}` : '')}
                              alt={`생성된 이미지 ${index + 1}`}
                              className="w-full h-auto"
                            />
                            <div className="p-4 flex justify-between items-center">
                              <span className="text-gray-600 font-medium">이미지 {index + 1}</span>
                              <a
                                href={image.url || `data:image/png;base64,${image.b64_json}`}
                                download={`seedream-${Date.now()}-${index + 1}.png`}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                              >
                                다운로드
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <details className="mt-6">
                    <summary className="cursor-pointer text-gray-600 text-sm hover:text-gray-800 mb-3 font-medium text-center">
                      전체 응답 보기 (JSON)
                    </summary>
                    <pre className="text-gray-700 text-sm overflow-x-auto bg-white/20 backdrop-blur-sm p-4 rounded-lg border border-white/30">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex items-center justify-center">
        <div className="text-gray-800 text-xl">로딩 중...</div>
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}