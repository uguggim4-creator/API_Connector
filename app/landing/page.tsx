'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Artwork {
  id: string;
  title: string;
  type: 'image' | 'video';
  platform: string;
  prompt: string;
  createdAt: string;
  imageUrl?: string;
  videoUrl?: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  // 로컬 스토리지에서 작품 불러오기
  useEffect(() => {
    const savedArtworks = localStorage.getItem('ai-artworks');
    if (savedArtworks) {
      try {
        setArtworks(JSON.parse(savedArtworks));
      } catch (error) {
        console.error('Failed to parse saved artworks:', error);
      }
    }
  }, []);

  // 최근 작품 4개만 표시
  const recentArtworks = artworks.slice(0, 4);

  const handleBannerClick = (type: 'image' | 'video') => {
    if (type === 'image') {
      router.push('/playground?tab=image');
    } else {
      router.push('/playground?tab=video');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">AI Studio</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">9:41</span>
              <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-12">
        <div className="space-y-16">
          {/* Spaces Section */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Spaces</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Banner */}
              <div 
                onClick={() => handleBannerClick('image')}
                className="bg-white rounded-2xl p-12 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-32 h-32 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">AI</span>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">IMAGE</h3>
                  <p className="text-gray-600 text-sm">Create stunning visuals</p>
                </div>
              </div>

              {/* Video Banner */}
              <div 
                onClick={() => handleBannerClick('video')}
                className="bg-white rounded-2xl p-12 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-32 h-32 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">AI</span>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">VIDEO</h3>
                  <p className="text-gray-600 text-sm">Generate dynamic content</p>
                </div>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">PROJECTS</h2>
            </div>

            {recentArtworks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentArtworks.map((artwork) => (
                  <div key={artwork.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="aspect-square">
                      {artwork.type === 'image' && artwork.imageUrl ? (
                        <img 
                          src={artwork.imageUrl} 
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      ) : artwork.type === 'video' && artwork.videoUrl ? (
                        <video 
                          src={artwork.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            {artwork.type.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-black text-sm line-clamp-1">{artwork.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(artwork.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {artwork.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-gray-400">+</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                <p className="text-gray-400 mb-6">Start creating with AI</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => handleBannerClick('image')}
                    className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    Create Image
                  </button>
                  <button 
                    onClick={() => handleBannerClick('video')}
                    className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    Create Video
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}