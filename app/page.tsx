'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  // Image generation state
  const [imageModel, setImageModel] = useState('seedream');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<any>(null);

  // Video generation state
  const [videoModel, setVideoModel] = useState('kling');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<any>(null);

  const handleImageGenerate = async () => {
    setImageLoading(true);
    setImageResult(null);

    try {
      const response = await fetch(`/api/platforms/${imageModel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'image',
          prompt: imagePrompt,
          model: imageModel === 'seedream' ? 'seedream-4-0-250828' : 'nanobanana-v1',
        }),
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
            <Link
              href="/settings"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm"
            >
              API 설정
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Generation Workspace */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="space-y-4">
              {/* Model Dropdown */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">이미지 모델</label>
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
                  rows={6}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg border border-gray-800 focus:border-blue-500 focus:outline-none resize-none"
                />
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
            <div className="space-y-4">
              {/* Model Dropdown */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">비디오 모델</label>
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
                  rows={6}
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
            {' '}또는{' '}
            <Link href="/playground" className="text-blue-400 hover:text-blue-300">
              고급 Playground
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
