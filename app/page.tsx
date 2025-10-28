'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">AI Platform API Hub</h1>
          <p className="text-gray-400 mt-2">통합 AI 플랫폼 API 관리 시스템</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* OpenAI */}
          <PlatformCard
            name="OpenAI"
            description="GPT, DALL-E, Whisper 등 다양한 AI 모델"
            icon="🤖"
            status="active"
            platformId="openai"
            onClick={() => router.push('/playground?platform=openai')}
          />

          {/* Google Gemini */}
          <PlatformCard
            name="Google Gemini"
            description="구글의 차세대 멀티모달 AI 모델"
            icon="✨"
            status="active"
            platformId="gemini"
            onClick={() => router.push('/playground?platform=gemini')}
          />

          {/* Google Veo 3.1 */}
          <PlatformCard
            name="Google Veo 3.1"
            description="고품질 AI 비디오 생성 (최대 60초, 1080p)"
            icon="🎬"
            status="active"
            platformId="veo"
            onClick={() => router.push('/playground?platform=veo')}
          />

          {/* Kling AI */}
          <PlatformCard
            name="Kling AI"
            description="텍스트/이미지에서 비디오 생성"
            icon="🎥"
            status="active"
            platformId="kling"
            onClick={() => router.push('/playground?platform=kling')}
          />

          {/* Seedream 4.0 */}
          <PlatformCard
            name="Seedream 4.0"
            description="ByteDance의 4K AI 이미지 생성"
            icon="🖼️"
            status="active"
            platformId="seedream"
            onClick={() => router.push('/playground?platform=seedream')}
          />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">시작하기</h2>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm mr-3">1</span>
                <span>각 플랫폼의 API 키를 발급받으세요</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm mr-3">2</span>
                <span>설정 페이지에서 API 키를 등록하세요</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm mr-3">3</span>
                <span>통합 인터페이스를 통해 다양한 AI 모델을 사용하세요</span>
              </li>
            </ol>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">빠른 링크</h2>
            <div className="space-y-3">
              <a
                href="/setup"
                className="block px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-center font-semibold"
              >
                🧙 초기 설정 마법사
              </a>
              <a
                href="/settings"
                className="block px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-center font-semibold"
              >
                ⚙️ API 키 관리
              </a>
              <a
                href="/playground"
                className="block px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-center font-semibold"
              >
                🎮 API Playground
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">API 문서 및 개발자 리소스</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="https://platform.openai.com/docs/models/sora-2"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-lg transition-colors text-center font-semibold"
            >
              🎬 Sora 2 API
            </a>
            <a
              href="https://klingai.com/global/dev"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-colors text-center font-semibold"
            >
              🎥 Kling API
            </a>
            <a
              href="https://aistudio.google.com/app/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-colors text-center font-semibold"
            >
              ✨ Veo 3.1 Google API
            </a>
            <a
              href="https://seed.bytedance.com/en/seedream4_0"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg transition-colors text-center font-semibold"
            >
              🖼️ Seedream API
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

interface PlatformCardProps {
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
  platformId: string;
  onClick: () => void;
}

function PlatformCard({ name, description, icon, status, onClick }: PlatformCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-4xl">{icon}</span>
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'active'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
