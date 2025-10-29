'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// You can create this as a separate component file if you want
const IconComponent = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M42.6667 45.3333V40.2222C42.6667 36.9391 41.3857 33.7997 39.1102 31.5242C36.8346 29.2486 33.6952 28 30.4122 28H18.6667C16.8889 28 15.1811 28.7024 13.9311 29.9524C12.681 31.2025 12 32.9103 12 34.6889V45.3333H42.6667Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 4V18.6667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.6667 4H45.3334" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M52 18.6667V45.3333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M52 4H54.6667V6.66667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 60V57.3333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 4H6.66667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60 60H57.3333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 60H9.33333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60 4V6.66667" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 18.6667V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


function MainPageContent() {
  const searchParams = useSearchParams();
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
      // Replace with actual API call to image generation endpoint
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
      // Replace with actual API call to video generation endpoint
       setResult({
        success: true,
        data: {
          data: [
            // Using placeholder image for video result for now
            { url: `https://picsum.photos/seed/${Math.random()}/800/600` },
          ]
        }
      });
    }

    setLoading(false);
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', 'flip');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.getData('text/plain') === 'flip') {
      setView(prev => prev === 'image' ? 'video' : 'image');
    }
  };


  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <div 
        className="w-full h-full"
        style={{ perspective: '2000px' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div 
          className="relative w-full h-full transition-transform duration-700"
          style={{ transformStyle: 'preserve-3d', transform: view === 'video' ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Image View (Front) */}
          <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
            <div className="flex flex-col items-center justify-center h-full">
              <div 
                draggable 
                onDragStart={handleDragStart}
                className="text-center mb-8 cursor-grab" 
                onClick={() => setView('video')}
              >
                <IconComponent />
                <h1 className="text-5xl font-bold mt-4">AI IMAGE STUDIO</h1>
                <p className="text-gray-400 mt-2">Create stunning, high-aesthetic images in seconds</p>
              </div>
              
              <div className="w-full max-w-2xl bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the scene you imagine"
                  className="flex-grow bg-transparent focus:outline-none"
                />
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <select
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value)}
                    className="bg-[#2C2C2E] rounded-md px-2 py-1 focus:outline-none"
                  >
                    <option value="seedream">Seedream 4.0</option>
                    <option value="openai">DALL-E 3</option>
                  </select>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="bg-[#2C2C2E] rounded-md px-2 py-1 focus:outline-none"
                  >
                    <option value="3:4">3:4</option>
                    <option value="1:1">1:1</option>
                    <option value="16:9">16:9</option>
                  </select>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-lime-400 text-black font-bold px-6 py-3 rounded-xl hover:bg-lime-500 transition-colors disabled:bg-gray-600"
                >
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>

          {/* Video View (Back) */}
          <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="flex items-center justify-center h-full">
                <div 
                  draggable
                  onDragStart={handleDragStart}
                  className="w-full max-w-sm bg-[#1C1C1E] rounded-3xl p-6 cursor-grab"
                  onClick={() => setView('image')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Video</h2>
                  </div>
                  <div className="bg-gray-700 h-40 rounded-xl mb-4 flex items-center justify-center">
                    <p className="text-gray-400">Upload image (Optional)</p>
                  </div>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="Describe the scene you imagine, with details."
                    rows={3}
                    className="w-full bg-[#2C2C2E] rounded-lg p-3 mb-4 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="bg-[#2C2C2E] p-3 rounded-lg">
                      <label className="text-gray-400">Model</label>
                      <select
                        value={videoModel}
                        onChange={(e) => setVideoModel(e.target.value)}
                        className="w-full bg-transparent font-bold focus:outline-none"
                      >
                        <option value="sora">Sora 2</option>
                        <option value="veo">Veo 3.1</option>
                      </select>
                    </div>
                     <div className="bg-[#2C2C2E] p-3 rounded-lg">
                      <label className="text-gray-400">Duration</label>
                       <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full bg-transparent font-bold focus:outline-none"
                      >
                        <option value={12}>12s</option>
                        <option value={30}>30s</option>
                      </select>
                    </div>
                     <div className="bg-[#2C2C2E] p-3 rounded-lg">
                      <label className="text-gray-400">Aspect Ratio</label>
                       <select
                        value={videoAspectRatio}
                        onChange={(e) => setVideoAspectRatio(e.target.value)}
                        className="w-full bg-transparent font-bold focus:outline-none"
                      >
                        <option value="16:9">16:9</option>
                        <option value="9:16">9:16</option>
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
            </div>
          </div>
        </div>
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