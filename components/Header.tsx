"use client";

import { useEffect, useState } from "react";
import { createClientSupabaseClient } from "@/lib/supabase-auth";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    setMenuOpen(false);
  };

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
            
            {/* 로그인/사용자 메뉴 */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 hover:scale-105 text-sm text-white transition-all duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.email}</span>
                </button>

                {/* 드롭다운 메뉴 */}
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl z-20 overflow-hidden animate-dropdown">
                      <div className="p-3 border-b border-white/10">
                        <div className="text-sm text-white/60">로그인됨</div>
                        <div className="text-sm text-white font-medium truncate">{user.email}</div>
                      </div>
                      <div className="p-2">
                        <a
                          href="/profile"
                          className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          프로필
                        </a>
                        <a
                          href="/setup"
                          className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          API 설정
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          로그아웃
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a
                href="/auth/login"
                className="px-4 py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 hover:scale-105 text-sm text-white transition-all duration-200"
              >
                로그인
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
