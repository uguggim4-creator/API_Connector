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
  const [seedreamSize, setSeedreamSize] = useState(''); // 2K, 4K 등 (비어있으면 width/height 사용)
  const [seedreamWidth, setSeedreamWidth] = useState(2048);
  const [seedreamHeight, setSeedreamHeight] = useState(2048);
  const [seedreamNumImages, setSeedreamNumImages] = useState(1);
  const [seedreamResponseFormat, setSeedreamResponseFormat] = useState('url');
  const [seedreamWatermark, setSeedreamWatermark] = useState(true);
  const [seedreamSequentialGeneration, setSeedreamSequentialGeneration] = useState('disabled');
  const [seedreamReferenceImages, setSeedreamReferenceImages] = useState<string[]>([]);

  // Veo
  const [veoPrompt, setVeoPrompt] = useState('');
  const [veoDuration, setVeoDuration] = useState(10);

  // 이미지 파일을 base64로 변환하는 함수
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSeedreamReferenceImages((prev) => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 참조 이미지 제거 함수
  const removeReferenceImage = (index: number) => {
    setSeedreamReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

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
          body = {
            action: 'image',
            model: seedreamModel,
            prompt: seedreamPrompt,
            num_images: seedreamNumImages,
            response_format: seedreamResponseFormat,
            watermark: seedreamWatermark,
            sequential_image_generation: seedreamSequentialGeneration,
          };
          // 해상도 설정: size 프리셋이 있으면 사용, 없으면 width/height 사용
          if (seedreamSize) {
            body.size = seedreamSize;
          } else {
            body.width = seedreamWidth;
            body.height = seedreamHeight;
          }
          // 참조 이미지가 있으면 추가
          if (seedreamReferenceImages.length > 0) {
            body.image_url = seedreamReferenceImages;
            console.log(`📸 참조 이미지 ${seedreamReferenceImages.length}개 전송 중...`);
            console.log('이미지 형식:', seedreamReferenceImages[0]?.substring(0, 50) + '...');
          }
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
                      <label className="block text-gray-300 mb-2">이미지 개수</label>
                      <select
                        value={seedreamNumImages}
                        onChange={(e) => setSeedreamNumImages(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                      >
                        <option value={1}>1개</option>
                        <option value={2}>2개</option>
                        <option value={4}>4개</option>
                      </select>
                    </div>
                  </div>

                  {/* 해상도 설정 */}
                  <div>
                    <label className="block text-gray-300 mb-2">해상도 프리셋</label>
                    <select
                      value={seedreamSize}
                      onChange={(e) => setSeedreamSize(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="">사용자 지정 (아래 너비/높이 사용)</option>
                      <option value="2K">2K (2048x2048)</option>
                      <option value="4K">4K (4096x4096)</option>
                    </select>
                  </div>

                  {/* 사용자 지정 해상도 */}
                  {!seedreamSize && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">너비</label>
                        <input
                          type="number"
                          value={seedreamWidth}
                          onChange={(e) => setSeedreamWidth(Number(e.target.value))}
                          step={64}
                          min={512}
                          max={4096}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">높이</label>
                        <input
                          type="number"
                          value={seedreamHeight}
                          onChange={(e) => setSeedreamHeight(Number(e.target.value))}
                          step={64}
                          min={512}
                          max={4096}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        />
                      </div>
                    </div>
                  )}

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

                  {/* 참조 이미지 업로드 */}
                  <div>
                    <label className="block text-gray-300 mb-2">참조 이미지 (선택사항)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer"
                    />
                    <p className="text-gray-500 text-sm mt-1">업로드한 이미지를 참조하여 새로운 이미지를 생성합니다</p>
                  </div>

                  {/* 참조 이미지 미리보기 */}
                  {seedreamReferenceImages.length > 0 && (
                    <div>
                      <label className="block text-gray-300 mb-2">참조 이미지 ({seedreamReferenceImages.length}개)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {seedreamReferenceImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`참조 이미지 ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-600"
                            />
                            <button
                              onClick={() => removeReferenceImage(index)}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
