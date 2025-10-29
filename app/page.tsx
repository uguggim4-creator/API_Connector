'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function MainPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<'image' | 'video'>('image');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'video') {
      setView('video');
    } else {
      setView('image');
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // States for Image Generation
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageModel, setImageModel] = useState('seedream');
  const [aspectRatio, setAspectRatio] = useState('3:4');

  // States for Video Generation
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoModel, setVideoModel] = useState('sora');
  const [duration, setDuration] = useState(12);
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (view === 'image') {
      console.log('Generating image with:', { imagePrompt, imageModel, aspectRatio });
      setResult({
        success: true,
        data: {
          data: [
            { url: `https://picsum.photos/seed/${Math.random()}/800/600` },
            { url: `https://picsum.photos/seed/${Math.random()}/800/600` },
          ]
        }
      });
    } else {
      console.log('Generating video with:', { videoPrompt, videoModel, duration, videoAspectRatio });
      setResult({
        success: true,
        data: {
          data: [
            { url: `https://picsum.photos/seed/${Math.random()}/800/600` },
          ]
        }
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* API Settings Button - Fixed position */}
      <button
        onClick={() => router.push('/settings')}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm transition-colors"
      >
        API Settings
      </button>

      {/* Tab Toggle Buttons */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
        <button
          onClick={() => setView('image')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            view === 'image' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
          }`}
        >
          Image
        </button>
        <button
          onClick={() => setView('video')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            view === 'video' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
          }`}
        >
          Video
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Image View */}
        {view === 'image' && (
          <div className="w-full max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold mb-4">AI IMAGE STUDIO</h1>
            </div>
            
            <div className="bg-[#1C1C1E] rounded-2xl p-6">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the scene you imagine"
                className="w-full bg-transparent text-lg focus:outline-none mb-4 p-2"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div>
                    <label className="block mb-1">Model</label>
                    <select
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      className="bg-[#2C2C2E] rounded-md px-3 py-2 focus:outline-none text-white"
                    >
                      <option value="seedream">Seedream 4.0</option>
                      <option value="openai">DALL-E 3</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="bg-[#2C2C2E] rounded-md px-3 py-2 focus:outline-none text-white"
                    >
                      <option value="3:4">3:4</option>
                      <option value="1:1">1:1</option>
                      <option value="16:9">16:9</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-lime-400 text-black font-bold px-8 py-3 rounded-xl hover:bg-lime-500 transition-colors disabled:bg-gray-600"
                >
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>

            {/* Results */}
            {result && result.success && (
              <div className="mt-8 grid grid-cols-2 gap-4">
                {result.data?.data?.map((img: any, idx: number) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Generated ${idx + 1}`}
                    className="w-full rounded-xl"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video View */}
        {view === 'video' && (
          <div className="w-full max-w-xl">
            <div className="bg-[#1C1C1E] rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Video Generation</h2>
              </div>
              
              <div className="bg-gray-700 h-48 rounded-xl mb-6 flex items-center justify-center">
                <p className="text-gray-400">Upload image (Optional)</p>
              </div>
              
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe the scene you imagine, with details."
                rows={4}
                className="w-full bg-[#2C2C2E] rounded-lg p-4 mb-6 focus:outline-none resize-none"
              />
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#2C2C2E] p-4 rounded-lg">
                  <label className="text-gray-400 text-sm block mb-2">Model</label>
                  <select
                    value={videoModel}
                    onChange={(e) => setVideoModel(e.target.value)}
                    className="w-full bg-transparent font-bold focus:outline-none text-white"
                  >
                    <option value="sora">Sora 2</option>
                    <option value="veo">Veo 3.1</option>
                    <option value="kling">Kling AI</option>
                  </select>
                </div>
                
                <div className="bg-[#2C2C2E] p-4 rounded-lg">
                  <label className="text-gray-400 text-sm block mb-2">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-transparent font-bold focus:outline-none text-white"
                  >
                    <option value={12}>12s</option>
                    <option value={30}>30s</option>
                    <option value={60}>60s</option>
                  </select>
                </div>
                
                <div className="bg-[#2C2C2E] p-4 rounded-lg col-span-2">
                  <label className="text-gray-400 text-sm block mb-2">Aspect Ratio</label>
                  <select
                    value={videoAspectRatio}
                    onChange={(e) => setVideoAspectRatio(e.target.value)}
                    className="w-full bg-transparent font-bold focus:outline-none text-white"
                  >
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                    <option value="1:1">1:1</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-lime-400 text-black font-bold py-4 rounded-xl hover:bg-lime-500 transition-colors disabled:bg-gray-600"
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {/* Results */}
            {result && result.success && (
              <div className="mt-8">
                {result.data?.data?.map((vid: any, idx: number) => (
                  <div key={idx} className="bg-gray-800 rounded-xl overflow-hidden">
                    <img
                      src={vid.url}
                      alt={`Generated video ${idx + 1}`}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <MainPageContent />
    </Suspense>
  );
}
