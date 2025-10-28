'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  // Image generation state
  const [imageModel, setImageModel] = useState('seedream');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<any>(null);

  // Image settings
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [responseFormat, setResponseFormat] = useState('url');
  const [sequentialGeneration, setSequentialGeneration] = useState('disabled');
  const [watermark, setWatermark] = useState(true);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // Video generation state
  const [videoModel, setVideoModel] = useState('kling');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<any>(null);

  // Resolution mapping
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

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (referenceImages.length + files.length > 10) {
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
          alert(`${file.name}: 파일 크기가 10MB를 초과합니다.`);
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

        setReferenceImages((prev) => [...prev, uploadResult.url]);
        console.log(`✅ 이미지 업로드 완료: ${file.name} → ${uploadResult.url}`);
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }

    e.target.value = '';
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageGenerate = async () => {
    setImageLoading(true);
    setImageResult(null);

    try {
      const resolution = resolutionMap[aspectRatio];
      const body: any = {
        action: 'image',
        prompt: imagePrompt,
        model: imageModel === 'seedream' ? 'seedream-4-0-250828' : 'nanobanana-v1',
        width: resolution.width,
        height: resolution.height,
        response_format: responseFormat,
        watermark: watermark,
        sequential_image_generation: sequentialGeneration,
      };

      const validImageUrls = referenceImages.filter(url => url && url.trim() !== '');
      if (validImageUrls.length > 0) {
        body.image = validImageUrls;
      }

      const response = await fetch(`/api/platforms/${imageModel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setImageResult(data);
    } catch (error) {
      console.error('Failed to generate image:', error);
      setImageResult({ success: false, error: 'Failed to generate image' });
    } finally {
      setImageLoading(false);
    }
  };

  const handleVideoGenerate = async () => {
    setVideoLoading(true);
    setVideoResult(null);

    try {
      const response = await fetch(`/api/platforms/${videoModel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'video',
          prompt: videoPrompt,
          duration: videoModel === 'veo' ? 10 : 5,
        }),
      });

      const data = await response.json();
      setVideoResult(data);
    } catch (error) {
      console.error('Failed to generate video:', error);
      setVideoResult({ success: false, error: 'Failed to generate video' });
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Simple Header */}
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">AI Studio</h1>
            <div className="flex gap-3">
              <Link
                href="/playground"
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm"
              >
                고급 모드
              </Link>
              <Link
                href="/settings"
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm"
              >
                API 설정
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Image Generation Workspace */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">이미지 생성</h2>
            <div className="space-y-4">
              {/* Model Dropdown */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">모델 선택</label>
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value)}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg border border-gray-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="seedream">Seedream 4.0 - 4K 이미지 생성</option>
                  <option value="nanobanana">Nanobanana - 고품질 이미지</option>
                </select>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">프롬프트</label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="이미지 설명을 입력하세요..."
                  rows={4}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg border border-gray-800 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">해상도</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-4 py-2 bg-black text-white rounded-lg border border-gray-800 focus:border-blue-500 focus:outline-none"
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
                <div>
                  <label className="block text-gray-400 text-sm mb-2">응답 형식</label>
                  <select
                    value={responseFormat}
                    onChange={(e) => setResponseFormat(e.target.value)}
                    className="w-full px-4 py-2 bg-black text-white rounded-lg border border-gray-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="url">URL</option>
                    <option value="base64">Base64</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">순차 생성</label>
                  <select
                    value={sequentialGeneration}
                    onChange={(e) => setSequentialGeneration(e.target.value)}
                    className="w-full px-4 py-2 bg-black text-white rounded-lg border border-gray-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="disabled">비활성화</option>
                    <option value="enabled">활성화</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watermark}
                      onChange={(e) => setWatermark(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-400 text-sm">워터마크 표시</span>
                  </label>
                </div>
              </div>

              {/* Reference Images Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-400 text-sm">참조 이미지 (선택)</label>
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
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors cursor-pointer"
                  >
                    📁 파일 업로드
                  </label>
                </div>
                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {referenceImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`참조 이미지 ${index + 1}`}
                          className="w-full h-20 object-cover rounded border border-gray-800"
                        />
                        <button
                          onClick={() => removeReferenceImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleImageGenerate}
                disabled={imageLoading || !imagePrompt}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
              >
                {imageLoading ? '생성 중...' : '이미지 생성'}
              </button>

              {/* Result */}
              {imageResult && (
                <div className="mt-4 p-4 bg-black rounded-lg border border-gray-800">
                  <div className={`text-sm ${imageResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {imageResult.success ? '✓ 생성 완료' : '✗ 생성 실패'}
                    {imageResult.duration && <span className="text-gray-500 ml-2">({imageResult.duration}ms)</span>}
                  </div>
                  {!imageResult.success && imageResult.error && (
                    <p className="text-red-400 text-sm mt-2">{imageResult.error}</p>
                  )}
                  {imageResult.success && imageResult.data?.data && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {imageResult.data.data.map((img: any, idx: number) => (
                        <img
                          key={idx}
                          src={img.url || `data:image/png;base64,${img.b64_json}`}
                          alt={`생성된 이미지 ${idx + 1}`}
                          className="w-full rounded-lg border border-gray-800"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Video Generation Workspace */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">비디오 생성</h2>
            <div className="space-y-4">
              {/* Model Dropdown */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">모델 선택</label>
                <select
                  value={videoModel}
                  onChange={(e) => setVideoModel(e.target.value)}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg border border-gray-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="sora">Sora 2 - OpenAI 최고 품질</option>
                  <option value="veo">Veo 3.1 - Google 1080p 60초</option>
                  <option value="kling">Kling AI - 움직임 제어</option>
                </select>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">프롬프트</label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="비디오 설명을 입력하세요..."
                  rows={4}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg border border-gray-800 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleVideoGenerate}
                disabled={videoLoading || !videoPrompt}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
              >
                {videoLoading ? '생성 중...' : '비디오 생성'}
              </button>

              {/* Result */}
              {videoResult && (
                <div className="mt-4 p-4 bg-black rounded-lg border border-gray-800">
                  <div className={`text-sm ${videoResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {videoResult.success ? '✓ 생성 완료' : '✗ 생성 실패'}
                    {videoResult.duration && <span className="text-gray-500 ml-2">({videoResult.duration}ms)</span>}
                  </div>
                  {!videoResult.success && videoResult.error && (
                    <p className="text-red-400 text-sm mt-2">{videoResult.error}</p>
                  )}
                  {videoResult.success && videoResult.data && (
                    <div className="mt-3">
                      <pre className="text-gray-400 text-xs overflow-x-auto">
                        {JSON.stringify(videoResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            API 키가 없으신가요?{' '}
            <Link href="/setup" className="text-blue-400 hover:text-blue-300">
              초기 설정 가이드
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
