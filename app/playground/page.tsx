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

  const availableTabs = ['image', 'video'];
  const currentTab = availableTabs.includes(activeTab) ? activeTab : availableTabs[0];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <Link href="/landing">
              <h1 className="text-4xl font-bold text-white mb-2 cursor-pointer">BeO.</h1>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-12">
        <div className="space-y-8">
          
          {/* Unified Creation Banner */}
          <section className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              
              {/* Top Section: Model and Tabs */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-black mb-2">Model Selection</h2>
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

              {/* Middle Section: Reference Image & Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                
                {/* Left: Reference Images */}
                <div>
                  <h2 className="text-xl font-semibold text-black mb-4">첨부 이미지</h2>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-black transition-colors mb-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <div className="text-4xl mb-2 text-gray-400">+</div>
                      <p className="text-gray-600 text-sm">Click to upload</p>
                    </label>
                  </div>
                  {seedreamReferenceImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {seedreamReferenceImages.map((url, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={url}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeReferenceImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Settings */}
                <div>
                  <h2 className="text-xl font-semibold text-black mb-4">설정탭</h2>
                  <div className="space-y-4">
                    {selectedPlatform === 'seedream' && (
                      <>
                        <div>
                          <label className="block text-black font-medium text-sm mb-1">Resolution</label>
                          <select
                            value={seedreamAspectRatio}
                            onChange={(e) => setSeedreamAspectRatio(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-black text-sm"
                          >
                            <option value="1:1">1:1</option>
                            <option value="16:9">16:9</option>
                            <option value="9:16">9:16</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-black font-medium text-sm mb-1">Response Format</label>
                           <select
                            value={seedreamResponseFormat}
                            onChange={(e) => setSeedreamResponseFormat(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-black text-sm"
                          >
                            <option value="url">URL</option>
                            <option value="base64">Base64</option>
                          </select>
                        </div>
                      </>
                    )}
                    {selectedPlatform !== 'seedream' && (
                       <p className="text-gray-500 text-sm">Settings for {selectedPlatform} will appear here.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Section: Prompt and Create Button */}
              <div>
                <textarea
                  placeholder="Enter your prompt here..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-black placeholder-gray-500 mb-4"
                  onChange={(e) => {
                    // This needs to update the correct prompt based on the selected platform
                    // This is a simplified logic. In a real app, this would be more robust.
                    if (selectedPlatform === 'seedream') setSeedreamPrompt(e.target.value);
                    if (selectedPlatform === 'openai') setOpenaiPrompt(e.target.value);
                    if (selectedPlatform === 'gemini') setGeminiPrompt(e.target.value);
                    if (selectedPlatform === 'kling') setKlingPrompt(e.target.value);
                    if (selectedPlatform === 'veo') setVeoPrompt(e.target.value);
                  }}
                />
                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-10 py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Creating...' : 'CREATE'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Result Section */}
          {result && (
            <section className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-semibold text-black mb-4 text-center">결과물</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.success && result.data?.data?.map((image: any, index: number) => (
                    <div key={index} className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
                      <img
                        src={image.url || (image.b64_json ? `data:image/png;base64,${image.b64_json}` : '')}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {!result.success && (
                  <p className="text-red-500 text-center">{result.error}</p>
                )}
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