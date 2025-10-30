"use client";

import { useState, useEffect, useRef } from "react";

export default function ExplorePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handlePlanetHover = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1500);
  };

  const categories = [
    {
      name: "AI Agent",
      icon: "🤖",
      sites: [
        { name: "ChatGPT", url: "https://chat.openai.com", favicon: "openai.com" },
        { name: "Perplexity", url: "https://www.perplexity.ai", favicon: "perplexity.ai" },
        { name: "Gemini", url: "https://gemini.google.com", favicon: "google.com" },
        { name: "Claude", url: "https://claude.ai", favicon: "claude.ai" },
        { name: "Grok", url: "https://grok.x.ai", favicon: "x.ai" },
        { name: "Genspark", url: "https://www.genspark.ai", favicon: "genspark.ai" },
        { name: "Flowith", url: "https://flowith.io", favicon: "flowith.io" },
      ],
    },
    {
      name: "Image",
      icon: "🎨",
      sites: [
        { name: "Midjourney", url: "https://www.midjourney.com", favicon: "midjourney.com" },
        { name: "Imagine Art", url: "https://www.imagine.art", favicon: "imagine.art" },
        { name: "Sora", url: "https://sora.com", favicon: "openai.com" },
        { name: "Flux", url: "https://flux.ai", favicon: "flux.ai" },
        { name: "Dreamina", url: "https://dreamina.ai", favicon: "dreamina.ai" },
      ],
    },
    {
      name: "Video",
      icon: "🎬",
      sites: [
        { name: "Sora 2", url: "https://sora.com", favicon: "openai.com" },
        { name: "Runway", url: "https://runwayml.com", favicon: "runwayml.com" },
        { name: "Pika Labs", url: "https://pika.art", favicon: "pika.art" },
        { name: "Luma AI", url: "https://lumalabs.ai", favicon: "lumalabs.ai" },
        { name: "Kling", url: "https://klingai.com", favicon: "klingai.com" },
        { name: "Hailo", url: "https://hailo.ai", favicon: "hailo.ai" },
        { name: "Higgsfield", url: "https://higgsfield.ai", favicon: "higgsfield.ai" },
        { name: "Topaz", url: "https://www.topazlabs.com", favicon: "topazlabs.com" },
        { name: "Freepik", url: "https://www.freepik.com", favicon: "freepik.com" },
      ],
    },
    {
      name: "Voice/Lip-Sync",
      icon: "🎤",
      sites: [
        { name: "Elevenlabs", url: "https://elevenlabs.io", favicon: "elevenlabs.io" },
        { name: "Supertone", url: "https://supertone.ai", favicon: "supertone.ai" },
        { name: "Typecast", url: "https://typecast.ai", favicon: "typecast.ai" },
        { name: "Heygen", url: "https://www.heygen.com", favicon: "heygen.com" },
        { name: "Hedra", url: "https://www.hedra.com", favicon: "hedra.com" },
      ],
    },
    {
      name: "Coding",
      icon: "💻",
      sites: [
        { name: "Google AI Studio", url: "https://aistudio.google.com", favicon: "google.com" },
        { name: "Lovable", url: "https://lovable.dev", favicon: "lovable.dev" },
        { name: "Replit AI", url: "https://replit.com", favicon: "replit.com" },
        { name: "Cursor", url: "https://cursor.sh", favicon: "cursor.sh" },
        { name: "Claude", url: "https://claude.ai", favicon: "claude.ai" },
        { name: "Bolt", url: "https://bolt.new", favicon: "bolt.new" },
      ],
    },
    {
      name: "Music",
      icon: "🎵",
      sites: [
        { name: "Suno AI", url: "https://suno.ai", favicon: "suno.ai" },
        { name: "Udio", url: "https://udio.com", favicon: "udio.com" },
        { name: "AIVA", url: "https://www.aiva.ai", favicon: "aiva.ai" },
      ],
    },
  ];

  return (
    <>
      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-black"
        style={{
          backgroundImage: "url('/background.jpg')",
          opacity: 0.95,
        }}
      />

      {/* 우주 비행사 커서 트레일 */}
      <div
        className="pointer-events-none fixed w-8 h-8 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-xl transition-all duration-300 ease-out z-50"
        style={{
          left: mousePos.x - 16,
          top: mousePos.y - 16,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* 물결 효과 */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="pointer-events-none fixed rounded-full border-2 border-blue-400/50 animate-ripple z-50"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: "20px",
            height: "20px",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      <div className="min-h-screen text-white relative z-10">
        {/* 메인 컨텐츠 */}
        <div className="container mx-auto px-4 py-8 relative">
          {/* 카테고리 */}
          <div className="space-y-12">
            {categories.map((category, idx) => {
              return (
              <div
                key={category.name}
                className="relative"
                style={{
                  animation: `float ${3 + idx * 0.5}s ease-in-out infinite`,
                }}
              >
                {/* 카테고리 헤더 */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {category.name}
                  </h2>
                </div>

                {/* 사이트들 */}
                <div className="flex flex-wrap justify-center gap-8">
                  {category.sites.map((site, siteIdx) => (
                    <a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={handlePlanetHover}
                      className="group relative flex flex-col items-center gap-2 p-2 transition-all hover:scale-125 scale-100 opacity-100"
                      style={{
                        animation: `orbit ${5 + siteIdx * 0.3}s ease-in-out infinite`,
                        animationDelay: `${siteIdx * 0.05}s`,
                      }}
                    >
                      {/* 행성 (파비콘) */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/40 group-hover:to-purple-500/40 rounded-full blur-xl transition-all duration-500" />
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${site.favicon}&sz=128`}
                          alt={site.name}
                          className="relative w-16 h-16 rounded-full group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl">
                          {category.icon}
                        </div>
                      </div>

                      {/* 사이트 이름 */}
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white/80 group-hover:text-blue-300 transition-colors duration-300">
                          {site.name}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes orbit {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes ripple {
          0% {
            width: 20px;
            height: 20px;
            opacity: 1;
          }
          100% {
            width: 100px;
            height: 100px;
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes gather {
          0% {
            transform: translateX(-200px) translateY(-200px) scale(0);
            opacity: 0;
          }
          100% {
            transform: translateX(0) translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-ripple {
          animation: ripple 1.5s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-gather {
          animation: gather 1s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </>
  );
}
