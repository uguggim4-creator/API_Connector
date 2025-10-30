"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="text-lg font-semibold tracking-tight text-white hover:scale-105 transition-transform duration-200">
              AInspire
            </a>
            <nav className="flex items-center gap-6">
              <a href="/generate" className="text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200">생성</a>
              <a href="/explore" className="text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200">EXPLORE</a>
              <a href="/community" className="text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200">커뮤니티</a>
              <a href="/feedback" className="text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200">피드백</a>
            </nav>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/#pricing-section" className="text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200">요금</a>
            <a href="mailto:contact@ainspire.com" className="text-sm text-white/80 hover:text-white hover:scale-105 transition-all duration-200">문의하기</a>
            <button className="px-4 py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 hover:scale-105 text-sm text-white transition-all duration-200">로그인</button>
          </nav>
        </div>
      </div>
    </header>
  );
}
