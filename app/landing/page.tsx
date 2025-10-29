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

  // 최근 작품 6개만 표시
  const recentArtworks = artworks.slice(0, 6);

  const handleBannerClick = (type: 'image' | 'video') => {
    if (type === 'image') {
      router.push('/playground?tab=image');
    } else {
      router.push('/playground?tab=video');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200">
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Creative Studio</h1>
              <p className="text-gray-600 text-lg">Create amazing content with AI</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-500">9:41</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-12">
        <div className="space-y-12">
          {/* Spaces Section */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Spaces</h2>
              <p className="text-gray-600">Choose your creative workspace</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Image Banner */}
              <div 
                onClick={() => handleBannerClick('image')}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
              >
                <div className="mb-6">
                  <div className="bg-gray-900 text-white px-4 py-2 rounded-lg inline-block mb-4">
                    <span className="text-sm font-medium">image</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Creates a new space with an empty content authoring module for image generation and editing.
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-gray-500">AI Image Generation</span>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <span className="text-blue-600 text-lg">🖼️</span>
                  </div>
                </div>
              </div>

              {/* Content Banner */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="mb-6">
                  <div className="bg-gray-900 text-white px-4 py-2 rounded-lg inline-block mb-4">
                    <span className="text-sm font-medium">Content</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">Type something to get started...</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Start with a blank canvas and let your creativity flow.
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-gray-500">General Content</span>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">📝</span>
                  </div>
                </div>
              </div>

              {/* Video Banner */}
              <div 
                onClick={() => handleBannerClick('video')}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
              >
                <div className="mb-6">
                  <div className="bg-gray-900 text-white px-4 py-2 rounded-lg inline-block mb-4">
                    <span className="text-sm font-medium">video</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-4">May 9, 2024</div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Text, images, and videos about AI Video Generation and creative storytelling.
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-gray-500">AI Video Generation</span>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <span className="text-purple-600 text-lg">🎬</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Project Section */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">PROJECT</h2>
              <p className="text-gray-600">Your recent AI creations</p>
            </div>

            {recentArtworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentArtworks.map((artwork) => (
                  <div key={artwork.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{artwork.title}</h3>
                      <div className="text-xs text-gray-500 mb-3">
                        {new Date(artwork.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {artwork.type === 'image' && artwork.imageUrl ? (
                        <img 
                          src={artwork.imageUrl} 
                          alt={artwork.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : artwork.type === 'video' && artwork.videoUrl ? (
                        <video 
                          src={artwork.videoUrl}
                          className="w-full h-32 object-cover rounded-lg"
                          muted
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            {artwork.type === 'image' ? '🖼️' : '🎬'} {artwork.type.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {artwork.platform}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {artwork.type}
                        </span>
                      </div>
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-gray-500 line-clamp-2">{artwork.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-gray-400">🎨</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6">Start creating amazing content with AI</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => handleBannerClick('image')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create Image
                  </button>
                  <button 
                    onClick={() => handleBannerClick('video')}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Create Video
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Additional Info Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📻</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Image of Radio by Dieter Rams</h3>
                  <p className="text-sm text-gray-500">Design inspiration</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Minimalist design principles applied to modern AI interfaces.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Material culture is</h3>
                  <p className="text-sm text-gray-500">Creative philosophy</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Understanding the relationship between technology and human creativity.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
