"use client";

import { useState } from "react";

export default function GalleryPage() {
  const [gallery] = useState<any[]>([]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI 결과 갤러리</h1>
      <div className="text-center text-white/60">준비 중입니다</div>
    </div>
  );
}
