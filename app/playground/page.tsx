'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const modelFromUrl = searchParams.get('model');
  const [selectedPlatform, setSelectedPlatform] = useState<string>(modelFromUrl || 'openai');

  // URL 파라미터가 변경될 때마다 선택된 플랫폼 업데이트
  useEffect(() => {
    if (modelFromUrl) {
      setSelectedPlatform(modelFromUrl);
    }
  }, [modelFromUrl]);
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
  const [seedreamAspectRatio, setSeedreamAspectRatio] = useState('1:1'); // 종횡비
  const [seedreamResponseFormat, setSeedreamResponseFormat] = useState('url');
  const [seedreamWatermark, setSeedreamWatermark] = useState(true);
  const [seedreamSequentialGeneration, setSeedreamSequentialGeneration] = useState('disabled');
  const [seedreamReferenceImages, setSeedreamReferenceImages] = useState<string[]>([]);

  // Veo
  const [veoPrompt, setVeoPrompt] = useState('');
  const [veoDuration, setVeoDuration] = useState(10);

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

  // 이미지 파일 업로드 처리 (공개 URL로 업로드)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 최대 10개 이미지 제한 확인
    if (seedreamReferenceImages.length + files.length > 10) {
      alert('최대 10개의 참조 이미지만 업로드할 수 있습니다.');
      return;
    }

    try {
      for (const file of Array.from(files)) {
        // 파일 형식 검증 (jpeg, png만 허용)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          alert(`${file.name}: 지원되지 않는 형식입니다. (jpeg, png만 허용)`);
          continue;
        }

        // 파일 크기 검증 (최대 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert(`${file.name}: 파일 크기가 10MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          continue;
        }

        // 이미지 해상도 검증
        const imageValidation = await new Promise<{ valid: boolean; message?: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const img = new Image();

            img.onload = () => {
              const width = img.width;
              const height = img.height;

              // 최소 크기 검증
              if (width <= 14 || height <= 14) {
                resolve({
                  valid: false,
                  message: `이미지가 너무 작습니다. (최소: 14x14px, 현재: ${width}x${height}px)`
                });
                return;
              }

              // 최대 픽셀 검증
              if (width > 6000 || height > 6000) {
                resolve({
                  valid: false,
                  message: `이미지가 너무 큽니다. (최대: 6000x6000px, 현재: ${width}x${height}px)`
                });
                return;
              }

              // 종횡비 검증 (1/3 ~ 3)
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

        // 파일을 서버에 업로드
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

        // Supabase에서 반환된 공개 URL 사용 (이미 전체 URL)
        const publicUrl = uploadResult.url;

        // 업로드된 이미지의 공개 URL 추가
        setSeedreamReferenceImages((prev) => [...prev, publicUrl]);
        console.log(`✅ 이미지 업로드 완료: ${file.name} → ${publicUrl}`);
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }

    // 파일 입력 초기화 (같은 파일을 다시 선택할 수 있도록)
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

          // 종횡비에 따른 해상도 매핑
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

          // 참조 이미지가 있으면 추가 (빈 URL 제외)
          const validImageUrls = seedreamReferenceImages.filter(url => url && url.trim() !== '');
          if (validImageUrls.length > 0) {
            body.image = validImageUrls;
            console.log(`📸 참조 이미지 ${validImageUrls.length}개 전송 중...`);
            console.log('이미지 URL:', validImageUrls);
          }
          // Save the request body for display in UI (seedream-specific feature)
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
    } catch (error) {
      console.error('Failed to call API:', error);
      setResult({ success: false, error: 'Failed to call API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">API Playground</h1>
              <p className="text-gray-400 mt-2">각 AI 플랫폼을 테스트해보세요</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 플랫폼 선택 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 sticky top-6">
              <h2 className="text-xl font-semibold text-white mb-4">플랫폼 선택</h2>
              <div className="space-y-2">
                {[
                  { id: 'openai', name: 'OpenAI', icon: '🤖' },
                  { id: 'gemini', name: 'Google Gemini', icon: '✨' },
                  { id: 'veo', name: 'Google Veo 3.1', icon: '🎬' },
                  { id: 'kling', name: 'Kling AI', icon: '🎥' },
                  { id: 'seedream', name: 'Seedream 4.0', icon: '🖼️' },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedPlatform === platform.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className="mr-2">{platform.icon}</span>
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 입력 폼 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">테스트 파라미터</h2>

              {selectedPlatform === 'openai' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">액션</label>
                    <select
                      value={openaiAction}
                      onChange={(e) => setOpenaiAction(e.target.value as 'chat' | 'image')}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="chat">텍스트 생성 (Chat)</option>
                      <option value="image">이미지 생성 (DALL-E)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">모델</label>
                    <select
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="dall-e-3">DALL-E 3</option>
                      <option value="dall-e-2">DALL-E 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={openaiPrompt}
                      onChange={(e) => setOpenaiPrompt(e.target.value)}
                      placeholder="프롬프트를 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                </div>
              )}

              {selectedPlatform === 'gemini' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">모델</label>
                    <select
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="gemini-pro-vision">Gemini Pro Vision</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={geminiPrompt}
                      onChange={(e) => setGeminiPrompt(e.target.value)}
                      placeholder="프롬프트를 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                </div>
              )}

              {selectedPlatform === 'kling' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={klingPrompt}
                      onChange={(e) => setKlingPrompt(e.target.value)}
                      placeholder="비디오 설명을 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">길이 (초)</label>
                    <select
                      value={klingDuration}
                      onChange={(e) => setKlingDuration(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value={5}>5초</option>
                      <option value={10}>10초</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedPlatform === 'seedream' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={seedreamPrompt}
                      onChange={(e) => setSeedreamPrompt(e.target.value)}
                      placeholder="이미지 설명을 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">모델</label>
                      <select
                        value={seedreamModel}
                        onChange={(e) => setSeedreamModel(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                      >
                        <option value="seedream-4-0-250828">Seedream 4.0 (250828)</option>
                        <option value="ByteDance-Seed/Seedream-4.0">Seedream 4.0 (Alt)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">해상도</label>
                      <select
                        value={seedreamAspectRatio}
                        onChange={(e) => setSeedreamAspectRatio(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
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

                  {/* 고급 설정 */}
                  <div className="border-t border-gray-600 pt-4">
                    <h3 className="text-gray-300 font-semibold mb-3">고급 설정</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 mb-2">응답 형식</label>
                          <select
                            value={seedreamResponseFormat}
                            onChange={(e) => setSeedreamResponseFormat(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                          >
                            <option value="url">URL</option>
                            <option value="base64">Base64</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2">순차 생성</label>
                          <select
                            value={seedreamSequentialGeneration}
                            onChange={(e) => setSeedreamSequentialGeneration(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
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
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="seedream-watermark" className="ml-2 text-gray-300">
                          워터마크 표시
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 참조 이미지 URL 입력 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-gray-300">참조 이미지 (선택사항)</label>
                      <div className="flex gap-2">
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
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-colors cursor-pointer"
                        >
                          📁 파일 업로드
                        </label>
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                        >
                          + URL 입력
                        </button>
                      </div>
                    </div>
                    {seedreamReferenceImages.map((url, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                          placeholder="https://your-domain.com/image.png"
                          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeReferenceImage(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    <p className="text-gray-500 text-sm mt-1">
                      파일 업로드 시 Supabase Storage에 저장 후 공개 URL로 전달 (jpeg/png, 최대 10MB, 해상도: 14px~6000px, 종횡비: 1:3~3:1)
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      💡 최대 10개 이미지 업로드 가능
                    </p>

                    {/* 참조 이미지 미리보기 */}
                    {seedreamReferenceImages.filter(url => url && url.trim() !== '').length > 0 && (
                      <div className="mt-4">
                        <label className="block text-gray-300 mb-2">이미지 미리보기</label>
                        <div className="grid grid-cols-3 gap-2">
                          {seedreamReferenceImages.filter(url => url && url.trim() !== '').map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`참조 이미지 ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-600"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPlatform === 'veo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">프롬프트</label>
                    <textarea
                      value={veoPrompt}
                      onChange={(e) => setVeoPrompt(e.target.value)}
                      placeholder="비디오 설명을 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">길이 (초)</label>
                    <input
                      type="number"
                      value={veoDuration}
                      onChange={(e) => setVeoDuration(Number(e.target.value))}
                      min={5}
                      max={60}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
              >
                {loading ? '처리 중...' : '실행'}
              </button>
            </div>

            {/* 결과 */}
            {result && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">결과</h2>
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-sm font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? '성공' : '실패'}
                    </span>
                    {result.duration && (
                      <span className="text-gray-400 text-sm">
                        ({result.duration}ms)
                      </span>
                    )}
                  </div>

                  {/* 에러 메시지 표시 */}
                  {!result.success && result.error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                      <p className="text-red-300 text-sm font-medium mb-1">오류 상세:</p>
                      <p className="text-red-200 text-sm">{result.error}</p>
                    </div>
                  )}

                  {/* Seedream 요청 JSON 표시 */}
                  {/* Double check for platform and requestBody for safety and clarity */}
                  {selectedPlatform === 'seedream' && requestBody && (
                    <details className="mb-4">
                      <summary className="cursor-pointer text-blue-400 text-sm hover:text-blue-300 mb-2 font-medium">
                        📤 전송한 요청 보기 (JSON)
                      </summary>
                      <pre className="text-gray-300 text-sm overflow-x-auto bg-gray-900/50 p-4 rounded border border-gray-600">
                        {JSON.stringify(requestBody, null, 2)}
                      </pre>
                    </details>
                  )}

                  {/* Seedream 이미지 결과 표시 */}
                  {selectedPlatform === 'seedream' && result.success && result.data?.data && (
                    <div className="mb-4">
                      <h3 className="text-white font-semibold mb-3">생성된 이미지</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.data.data.map((image: any, index: number) => (
                          <div key={index} className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-600">
                            <img
                              src={image.url || (image.b64_json ? `data:image/png;base64,${image.b64_json}` : '')}
                              alt={`생성된 이미지 ${index + 1}`}
                              className="w-full h-auto"
                            />
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-gray-400 text-sm">이미지 {index + 1}</span>
                              <a
                                href={image.url || `data:image/png;base64,${image.b64_json}`}
                                download={`seedream-${Date.now()}-${index + 1}.png`}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                              >
                                다운로드
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* JSON 응답 (접을 수 있는 형태) */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-gray-400 text-sm hover:text-gray-300 mb-2">
                      전체 응답 보기 (JSON)
                    </summary>
                    <pre className="text-gray-300 text-sm overflow-x-auto bg-gray-900/50 p-4 rounded">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}
