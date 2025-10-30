"use client";

import { useState } from "react";

const sampleVideos: any[] = [];

export default function FeedbackPage() {
  const [videos] = useState(sampleVideos);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI 영상 피드백 / 프롬프트 개선</h1>
      <div className="text-center text-white/60">준비 중입니다</div>
    </div>
  );
}
