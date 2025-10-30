"use client";

import { useState } from "react";

export default function GalleryPage() {
  // 샘플 데이터 (실제 구현 시 DB 연동)
  const [gallery, setGallery] = useState([
    {
      id: 1,
      type: "image",
      url: "/sample1.jpg",
      prompt: "A futuristic cityscape at sunset",
      user: "user1",
      likes: 12,
      comments: [
        { user: "user2", text: "멋져요!" },
        { user: "user3", text: "Awesome!" },
      ],
      tags: ["city", "future", "sunset"],
    },
    {
      id: 2,
      type: "video",
      url: "/sample2.mp4",
      prompt: "A robot dancing in the rain",
      user: "user2",
      likes: 7,
      comments: [],
      tags: ["robot", "dance", "rain"],
    },
  ]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI 결과 갤러리</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {gallery.map(item => (
          <div key={item.id} className="bg-white/5 rounded-xl shadow-lg p-6">
            <div className="mb-4">
              {item.type === "image" ? (
                <img src={item.url} alt={item.prompt} className="w-full rounded-lg" />
              ) : (
                <video src={item.url} controls className="w-full rounded-lg" />
              )}
            </div>
            <div className="mb-2 text-sm text-gray-300">프롬프트: {item.prompt}</div>
            <div className="mb-2 text-xs text-gray-400">작성자: {item.user}</div>
            <div className="mb-2 text-xs text-gray-400">태그: {item.tags.join(", ")}</div>
            <div className="flex items-center gap-4 mb-2">
              <span>👍 {item.likes}</span>
              <span>💬 {item.comments.length}</span>
            </div>
            <div className="space-y-1">
              {item.comments.map((c, idx) => (
                <div key={idx} className="text-xs text-gray-200">
                  <b>{c.user}:</b> {c.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
