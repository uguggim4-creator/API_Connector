'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 랜딩 페이지로 리다이렉트
    router.push('/landing');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-2xl">🎨</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Creative Studio</h1>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}