"use client";

import { useState } from "react";

const sampleVideos = [
  {
    id: 1,
    url: "/sample2.mp4",
    prompt: "A robot dancing in the rain",
    user: "user2",
    feedbacks: [
      { user: "user3", text: "프롬프트에 배경을 추가하면 더 좋아요!", adopted: true },
      { user: "user4", text: "로봇의 색상을 명확히 지정해보세요.", adopted: false },
    ],
    credits: 10,
  },
];

export default function FeedbackPage() {
  const [videos, setVideos] = useState(sampleVideos);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI 영상 피드백 / 프롬프트 개선</h1>
      <div className="space-y-8">
        {videos.map(v => (
          <div key={v.id} className="bg-white/5 rounded-xl shadow p-6">
            <video src={v.url} controls className="w-full rounded-lg mb-4" />
            <div className="mb-2 text-sm text-gray-300">프롬프트: {v.prompt}</div>
            <div className="mb-2 text-xs text-gray-400">작성자: {v.user}</div>
            <div className="mb-2 text-xs text-gray-400">크레딧: {v.credits}</div>
            <div className="mb-2 text-xs text-gray-400">피드백:</div>
            <div className="space-y-1">
              {v.feedbacks.map((f, idx) => (
                <div key={idx} className={`text-xs ${f.adopted ? 'text-green-400 font-bold' : 'text-gray-200'}`}>
                  <b>{f.user}:</b> {f.text} {f.adopted && <span className="ml-2">(채택됨 +크레딧)</span>}
                </div>
              ))}
            </div>
            <button className="mt-4 px-3 py-1 rounded bg-blue-600 text-white text-xs">피드백 남기기</button>
          </div>
        ))}
      </div>
    </div>
  );
}
