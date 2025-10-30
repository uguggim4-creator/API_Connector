"use client";

import { useState } from "react";

const samplePrompts = [
  {
    id: 1,
    title: "미래 도시 일러스트",
    prompt: "A futuristic cityscape at sunset, neon lights, flying cars, high detail, digital art",
    category: "일러스트",
    likes: 23,
    tags: ["city", "future", "neon"],
  },
  {
    id: 2,
    title: "동화풍 숲 배경",
    prompt: "A magical forest, fairy lights, soft colors, whimsical atmosphere, storybook style",
    category: "배경",
    likes: 15,
    tags: ["forest", "fairy", "storybook"],
  },
  {
    id: 3,
    title: "제품 사진 프롬프트",
    prompt: "E-commerce product photo, clean white background, studio lighting, high resolution",
    category: "제품사진",
    likes: 31,
    tags: ["product", "photo", "studio"],
  },
];

export default function PromptsPage() {
  const [prompts, setPrompts] = useState(samplePrompts);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">프롬프트 마켓 / 추천 프롬프트</h1>
      <div className="space-y-6">
        {prompts.map(p => (
          <div key={p.id} className="bg-white/5 rounded-xl shadow p-6">
            <div className="mb-2 text-lg font-semibold">{p.title}</div>
            <div className="mb-2 text-sm text-gray-300">{p.prompt}</div>
            <div className="mb-2 text-xs text-gray-400">카테고리: {p.category}</div>
            <div className="mb-2 text-xs text-gray-400">태그: {p.tags.join(", ")}</div>
            <div className="flex items-center gap-4">
              <span>👍 {p.likes}</span>
              <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs">프롬프트 복사</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
