"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type CardId = "images" | "videos" | "projects";

interface CardMeta {
  id: CardId;
  title: string;
  subtitle: string;
  tools: string[];
  depth: number; // parallax intensity
}

const initialCards: CardMeta[] = [
  {
    id: "images",
    title: "이미지 툴",
    subtitle: "Nanobanana · Seedream",
    tools: ["Nanobanana", "Seedream"],
    depth: 14,
  },
  {
    id: "videos",
    title: "비디오 툴",
    subtitle: "Kling · Veo 3.1 · Sora 2",
    tools: ["Kling", "Veo 3.1", "Sora 2"],
    depth: 10,
  },
  {
    id: "projects",
    title: "프로젝트",
    subtitle: "사용자 결과물",
    tools: ["최근 이미지", "최근 비디오"],
    depth: 18,
  },
];

export default function Home() {
  // Card order state (first index is centered in slider)
  const [order, setOrder] = useState<CardId[]>(["images", "videos", "projects"]);
  const cardMap = useMemo(
    () => Object.fromEntries(initialCards.map((c) => [c.id, c])),
    []
  ) as Record<CardId, CardMeta>;

  // Parallax removed per request

  // Slider: left/right rotate
  const slideLeft = () => setOrder((prev) => {
    const next = prev.slice();
    // move first to end (center -> right)
    next.push(next.shift() as CardId);
    return next;
  });
  const slideRight = () => setOrder((prev) => {
    const next = prev.slice();
    // move last to front (right -> center)
    next.unshift(next.pop() as CardId);
    return next;
  });

  // Drag & drop (cards reorder) + image cross-banner drag support
  const dragId = useRef<CardId | null>(null);
  const lastAutoMoveAt = useRef<number>(0);
  const DRAG_MIME = "text/uri-list";

  function isImageDrag(dt: DataTransfer | null): boolean {
    if (!dt) return false;
    const types = Array.from(dt.types as any as string[]);
    return types.includes(DRAG_MIME);
  }

  const onDragStart = (id: CardId) => (e: React.DragEvent) => {
    dragId.current = id;
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
  };

  const moveId = useCallback((list: CardId[], from: number, to: number) => {
    const next = list.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }, []);

  const onDrop = (targetId: CardId) => (e: React.DragEvent) => {
    e.preventDefault();
    // If this is an image URL drag, don't reorder cards here
    if (isImageDrag(e.dataTransfer)) return;
    const sourceId = (e.dataTransfer.getData("text/plain") as CardId) || dragId.current;
    if (!sourceId || sourceId === targetId) return;
    const from = order.indexOf(sourceId);
    const to = order.indexOf(targetId);
    if (from === -1 || to === -1) return;
    setOrder((prev) => moveId(prev, from, to));
    dragId.current = null;
  };

  // No modal; center card expands inline

  // Helpers
  const cards = initialCards;

  // Image tool state
  const [imgModel, setImgModel] = useState("seedream");
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgRatio, setImgRatio] = useState("1:1");
  const [imgCount, setImgCount] = useState<string>("1");
  const [imgTemplate, setImgTemplate] = useState("직접 입력");
  const [imgRefs, setImgRefs] = useState<string[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const seedreamTemplates = [
    "직접 입력",
    "Mockup",
    "Virtual Try-On",
    "Product Photos",
    "Storyboarding",
    "Portrait",
    "Anime",
    "Fashion",
    "Interior",
    "Food",
    "Car",
    "Architecture",
    "Illustration",
    "UI Mockup",
    "Kids Book",
    "Pixel Art",
    "Watercolor",
    "Oil Painting",
    "3D Render",
    "Cinematic",
    "Photorealistic",
  ];
  const nanobananaTemplates = ["직접 입력"];
  const templates = imgModel === "seedream" ? seedreamTemplates : nanobananaTemplates;

  const ratioMap: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },
    "4:3": { width: 1152, height: 864 },
    "3:4": { width: 864, height: 1152 },
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files) return;
    const allow = ["image/jpeg", "image/jpg", "image/png"];
    for (const f of Array.from(files)) {
      if (!allow.includes(f.type.toLowerCase())) continue;
      if (f.size > 10 * 1024 * 1024) continue;
      const fd = new FormData();
      fd.append("file", f);
      try {
        const r = await fetch("/api/upload-image", { method: "POST", body: fd });
        const j = await r.json();
        if (j.success && j.url) setImgRefs((p) => [...p, j.url]);
      } catch {}
    }
  };

  const generateImages = async () => {
    setImgLoading(true);
    try {
      const r = ratioMap[imgRatio] || ratioMap["1:1"];
      const parsedCount = Math.max(1, Math.min(4, parseInt((imgCount || "1"), 10) || 1));
      // Seedream 템플릿 프리셋 적용
      const seedreamTemplatePrefixes: Record<string, string> = {
        "Mockup": "Product mockup, studio lighting, seamless background, high dynamic range",
        "Virtual Try-On": "Virtual try-on, realistic cloth simulation, body alignment",
        "Product Photos": "E-commerce product photo, white background, sharp focus",
        "Storyboarding": "Storyboard frame, cinematic composition, shot framing",
        "Portrait": "Ultra-detailed portrait, natural skin texture, soft lighting",
        "Anime": "Anime style, clean line art, vibrant colors, high contrast",
        "Fashion": "Editorial fashion photography, dramatic lighting, runway look",
        "Interior": "Interior design render, global illumination, realistic materials",
        "Food": "Food photography, appetizing, soft shadows, shallow depth of field",
        "Car": "Automotive studio shot, reflective surfaces, dramatic lighting",
        "Architecture": "Architectural visualization, modern minimalism, wide angle",
        "Illustration": "Digital illustration, textured brush, cohesive color palette",
        "UI Mockup": "UI/UX mockup, clean layout, glassmorphism",
        "Kids Book": "Children's book illustration, friendly characters, pastel colors",
        "Pixel Art": "8-bit pixel art, limited color palette, retro style",
        "Watercolor": "Watercolor painting, soft edges, paper texture",
        "Oil Painting": "Oil painting, impasto texture, chiaroscuro",
        "3D Render": "Octane render, physically based rendering, dramatic lighting",
        "Cinematic": "Cinematic still, anamorphic bokeh, film grain",
        "Photorealistic": "Photo-realistic, natural lighting, accurate materials",
      };
      const templatePrefix = (imgModel === "seedream" && imgTemplate !== "직접 입력")
        ? seedreamTemplatePrefixes[imgTemplate] || ""
        : "";
      const finalPrompt = templatePrefix ? `${templatePrefix}\n${imgPrompt}` : imgPrompt;
      const body: any = {
        action: "image",
        prompt: finalPrompt,
        model: imgModel === "seedream" ? "seedream-4-0-250828" : "nanobanana-v1",
        width: r.width,
        height: r.height,
        response_format: "url",
        n: parsedCount,
        watermark: false,
      };
      if (imgRefs.length) body.image = imgRefs;
      const res = await fetch(`/api/platforms/${imgModel}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      // store to localStorage for Projects
      try {
        const prev = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
        const entry = { type: "image", at: Date.now(), request: body, result: data };
        prev.unshift(entry);
        const next = prev.slice(0, 50);
        localStorage.setItem("ainspire-results", JSON.stringify(next));
        setProjects(next);
      } catch {}
      alert(data.success ? "이미지 생성 완료" : `실패: ${data.error || "unknown"}`);
    } catch (e) {
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setImgLoading(false);
    }
  };

  // Video tool state
  const [vidModel, setVidModel] = useState("kling");
  const [vidPrompt, setVidPrompt] = useState("");
  const [vidRes, setVidRes] = useState("1280x720");
  const [vidSec, setVidSec] = useState(5);
  const [vidStart, setVidStart] = useState<string | null>(null);
  const [vidEnd, setVidEnd] = useState<string | null>(null);
  const [vidLoading, setVidLoading] = useState(false);

  const handleSingleImage = async (
    file: File | null,
    setUrl: (u: string) => void
  ) => {
    if (!file) return;
    const allow = ["image/jpeg", "image/jpg", "image/png"];
    if (!allow.includes(file.type.toLowerCase())) return;
    if (file.size > 10 * 1024 * 1024) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/upload-image", { method: "POST", body: fd });
      const j = await r.json();
      if (j.success && j.url) setUrl(j.url);
    } catch {}
  };

  const generateVideo = async () => {
    setVidLoading(true);
    try {
      const [w, h] = vidRes.split("x").map((n) => parseInt(n.trim(), 10));
      const body: any = {
        action: "video",
        prompt: vidPrompt,
        duration: Math.max(1, Math.min(60, vidSec)),
        width: isNaN(w) ? 1280 : w,
        height: isNaN(h) ? 720 : h,
      };
      if (vidStart) body.image = [vidStart];
      if (vidEnd) body.image_end = [vidEnd];
      const modelEndpoint = vidModel === "veo" ? "veo" : vidModel;
      const res = await fetch(`/api/platforms/${modelEndpoint}` , {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      try {
        const prev = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
        const entry = { type: "video", at: Date.now(), request: body, result: data };
        prev.unshift(entry);
        const next = prev.slice(0, 50);
        localStorage.setItem("ainspire-results", JSON.stringify(next));
        setProjects(next);
      } catch {}
      alert(data.success ? "비디오 요청 완료" : `실패: ${data.error || "unknown"}`);
    } catch {
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setVidLoading(false);
    }
  };

  // Projects list
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
      setProjects(arr);
    } catch {
      setProjects([]);
    }
  }, []);

  // Helpers to extract media from results for gallery
  const IMG_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
  const VID_EXT = [".mp4", ".webm", ".mov", ".m3u8"];
  function looksLikeUrl(v: string) {
    return typeof v === "string" && /^https?:\/\//i.test(v);
  }
  function isImageUrl(u: string) {
    const l = u.toLowerCase();
    return IMG_EXT.some(ext => l.includes(ext));
  }
  function isVideoUrl(u: string) {
    const l = u.toLowerCase();
    return VID_EXT.some(ext => l.includes(ext));
  }
  function extractMedia(obj: any, max = 12): { images: string[]; videos: string[] } {
    const images: string[] = [];
    const videos: string[] = [];
    const seen = new Set<any>();
    function walk(n: any, depth: number) {
      if (!n || depth > 6 || seen.has(n)) return;
      if (typeof n === "string") {
        if (looksLikeUrl(n)) {
          if (isImageUrl(n) && images.length < max) images.push(n);
          else if (isVideoUrl(n) && videos.length < max) videos.push(n);
        }
        return;
      }
      seen.add(n);
      if (Array.isArray(n)) {
        for (const v of n) walk(v, depth + 1);
      } else if (typeof n === "object") {
        for (const k of Object.keys(n)) walk((n as any)[k], depth + 1);
      }
    }
    walk(obj, 0);
    return { images, videos };
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-gradient.svg')",
          opacity: 0.95,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10">

      <div className="container mx-auto px-4 py-10">
        <header className="flex items-center justify-between mb-24">
          <h1 className="text-lg font-semibold tracking-tight">ainspire_내돈내산</h1>
          <Link
            href="/settings"
            className="px-4 py-2 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 text-sm text-white transition-colors"
          >
            API 관리
          </Link>
        </header>

        <section className="relative mx-auto flex items-center justify-center mb-32" onDragOver={onDragOver}>
          {/* Slider stage */}
          <div className="relative w-full max-w-7xl h-[480px] md:h-[540px] lg:h-[580px]">
            {cards.map((card: CardMeta) => {
              const tx = 0;
              const ty = 0;
              // position from order mapping
              const pos = order.indexOf(card.id);
              const baseX = pos === 0 ? 0 : pos === 1 ? -360 : 360;
              const baseScale = pos === 0 ? 1.08 : 0.84;
              const z = pos === 0 ? 40 : 20 - pos;
              return (
                <div
                  key={card.id}
                  role="button"
                  tabIndex={0}
                  draggable
                  onDragStart={onDragStart(card.id)}
                  onDrop={onDrop(card.id)}
                  className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none cursor-grab active:cursor-grabbing rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden w-[82%] md:w-[66%] lg:w-[58%] h-full will-change-transform"
                  style={{
                    transform: `translate3d(calc(-50% + ${baseX + tx}px), calc(-50% + ${ty}px), 0) scale(${baseScale})`,
                    transition: "transform 280ms cubic-bezier(.2,.8,.2,1)",
                    zIndex: z,
                  }}
                  onDragOver={(e) => {
                    // While dragging an image, hovering a side card auto-centers it
                    if (!isImageDrag(e.dataTransfer)) return;
                    const now = Date.now();
                    if (now - lastAutoMoveAt.current < 300) return;
                    if (pos === 1) {
                      lastAutoMoveAt.current = now;
                      slideLeft(); // bring left card to center
                    } else if (pos === 2) {
                      lastAutoMoveAt.current = now;
                      slideRight(); // bring right card to center
                    }
                  }}
                >
                {/* Card chrome */}
                <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative p-6 md:p-8 h-full overflow-y-auto custom-scroll">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                        {card.title}
                      </h2>
                      <span className="text-xs text-gray-300/80">{card.subtitle}</span>
                    </div>
                    {pos !== 0 && (
                      <>
                        <p className="text-sm text-gray-300 mb-4">{card.subtitle}</p>
                        <div className="flex flex-wrap gap-2">
                          {card.tools.map((t: string) => (
                            <span key={t} className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs text-gray-200">{t}</span>
                          ))}
                        </div>
                      </>
                    )}

                    {pos === 0 && card.id === "images" && (
                      <div className="grid grid-cols-1 gap-5 text-sm">
                        {/* 첨부 이미지 - 크게 */}
                        <div>
                          <div className="mb-2 font-medium">첨부 이미지</div>
                          <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6">
                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 cursor-pointer text-white">
                              업로드
                              <input type="file" accept="image/jpeg,image/jpg,image/png" multiple className="hidden" onChange={(e) => handleImageFiles(e.target.files)} />
                            </label>
                            {imgRefs.length > 0 && (
                              <div className="mt-4 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                {imgRefs.map((u, i) => (
                                  <img
                                    key={i}
                                    src={u}
                                    alt="ref"
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData(DRAG_MIME, u);
                                      e.dataTransfer.effectAllowed = "copy";
                                      // Create small drag image preview
                                      const dragImg = new Image();
                                      dragImg.src = u;
                                      dragImg.style.width = "80px";
                                      dragImg.style.height = "80px";
                                      dragImg.style.objectFit = "cover";
                                      dragImg.style.borderRadius = "8px";
                                      dragImg.style.opacity = "0.9";
                                      e.dataTransfer.setDragImage(dragImg, 40, 40);
                                    }}
                                    className="h-20 w-full object-cover rounded-md border border-white/15 cursor-grab active:cursor-grabbing"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 모델 / 비율 / 개수 / 템플릿 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <div className="mb-1 text-gray-300">모델</div>
                            <select value={imgModel} onChange={(e) => setImgModel(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2">
                              <option value="seedream">Seedream 4.0</option>
                              <option value="nanobanana">Nanobanana</option>
                            </select>
                          </div>
                          <div>
                            <div className="mb-1 text-gray-300">해상도 비율</div>
                            <select value={imgRatio} onChange={(e) => setImgRatio(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2">
                              {Object.keys(ratioMap).map((k) => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div className="mb-1 text-gray-300">이미지 갯수</div>
                            <input type="number" min={1} max={4} value={imgCount} onChange={(e) => setImgCount(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2" />
                          </div>
                          <div>
                            <div className="mb-1 text-gray-300">템플릿</div>
                            <select value={imgTemplate} onChange={(e) => setImgTemplate(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2">
                              {templates.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* 프롬프트 */}
                        <div>
                          <div className="mb-1 text-gray-300">프롬프트</div>
                          <textarea value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)} rows={4} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-3" placeholder="이미지 설명을 입력하세요" />
                        </div>

                        <div className="flex justify-end">
                          <button onClick={generateImages} disabled={imgLoading || !imgPrompt} className="px-5 py-2 rounded-lg bg-white/90 text-black hover:bg-white disabled:opacity-50">
                            {imgLoading ? "생성 중..." : "이미지 생성"}
                          </button>
                        </div>
                      </div>
                    )}

                    {pos === 0 && card.id === "videos" && (
                      <div className="grid grid-cols-1 gap-5 text-sm">
                        {/* 스타트/엔드 이미지 - 크게 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            onDragOver={(e) => {
                              if (!isImageDrag(e.dataTransfer)) return;
                              e.preventDefault();
                            }}
                            onDrop={(e) => {
                              if (!isImageDrag(e.dataTransfer)) return;
                              e.preventDefault();
                              const url = e.dataTransfer.getData(DRAG_MIME);
                              if (url) setVidStart(url);
                            }}
                          >
                            <div className="mb-2 font-medium">스타트 이미지</div>
                            <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6">
                              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 cursor-pointer text-white">
                                업로드
                                <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={(e) => handleSingleImage(e.target.files?.[0] || null, (u) => setVidStart(u))} />
                              </label>
                              {vidStart && <img src={vidStart} alt="start" className="mt-4 h-24 w-24 object-cover rounded-md border border-white/15" />}
                            </div>
                          </div>
                          <div
                            onDragOver={(e) => {
                              if (!isImageDrag(e.dataTransfer)) return;
                              e.preventDefault();
                            }}
                            onDrop={(e) => {
                              if (!isImageDrag(e.dataTransfer)) return;
                              e.preventDefault();
                              const url = e.dataTransfer.getData(DRAG_MIME);
                              if (url) setVidEnd(url);
                            }}
                          >
                            <div className="mb-2 font-medium">엔드 이미지</div>
                            <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6">
                              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 cursor-pointer text-white">
                                업로드
                                <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={(e) => handleSingleImage(e.target.files?.[0] || null, (u) => setVidEnd(u))} />
                              </label>
                              {vidEnd && <img src={vidEnd} alt="end" className="mt-4 h-24 w-24 object-cover rounded-md border border-white/15" />}
                            </div>
                          </div>
                        </div>

                        {/* 모델 / 해상도 / 시간 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <div className="mb-1 text-gray-300">모델</div>
                            <select value={vidModel} onChange={(e) => setVidModel(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2">
                              <option value="kling">Kling</option>
                              <option value="veo">Veo 3.1</option>
                              <option value="sora">Sora 2</option>
                            </select>
                          </div>
                          <div>
                            <div className="mb-1 text-gray-300">해상도</div>
                            <select value={vidRes} onChange={(e) => setVidRes(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2">
                              <option value="1280x720">1280x720</option>
                              <option value="1920x1080">1920x1080</option>
                              <option value="1080x1920">1080x1920</option>
                            </select>
                          </div>
                          <div>
                            <div className="mb-1 text-gray-300">비디오 시간(초)</div>
                            <input type="number" min={1} max={60} value={vidSec} onChange={(e) => setVidSec(parseInt(e.target.value || "5", 10))} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2" />
                          </div>
                        </div>

                        {/* 프롬프트 */}
                        <div>
                          <div className="mb-1 text-gray-300">프롬프트</div>
                          <textarea value={vidPrompt} onChange={(e) => setVidPrompt(e.target.value)} rows={4} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-3" placeholder="비디오 설명을 입력하세요" />
                        </div>

                        <div className="flex justify-end">
                          <button onClick={generateVideo} disabled={vidLoading || !vidPrompt} className="px-5 py-2 rounded-lg bg-white/90 text-black hover:bg-white disabled:opacity-50">
                            {vidLoading ? "요청 중..." : "비디오 생성"}
                          </button>
                        </div>
                      </div>
                    )}

                    {pos === 0 && card.id === "projects" && (
                      <div className="text-sm text-gray-200">
                        {projects.length === 0 ? (
                          <div className="text-gray-400">아직 저장된 결과물이 없습니다.</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map((p, i) => (
                              <div key={i} className="rounded-xl border border-white/15 bg-white/10 p-4">
                                <div className="text-xs text-gray-300 mb-1">{new Date(p.at).toLocaleString()}</div>
                                <div className="font-medium mb-2">{p.type?.toUpperCase?.() || p.type}</div>
                                <pre className="text-xs overflow-x-auto max-h-40">{JSON.stringify(p.result?.data || p.result, null, 2)}</pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arrows */}
          <button
            aria-label="이전"
            onClick={slideLeft}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/20 text-white"
          >
            ‹
          </button>
          <button
            aria-label="다음"
            onClick={slideRight}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/20 text-white"
          >
            ›
          </button>
        </section>
        {/* 결과물 갤러리 */}
        <section className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">결과물</h3>
            <button
              className="text-xs px-3 py-1.5 rounded-full border border-white/15 bg-white/10 hover:bg-white/15"
              onClick={() => {
                try {
                  const arr = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
                  setProjects(arr);
                } catch {}
              }}
            >
              새로고침
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-sm text-white/50">아직 생성된 결과가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {projects.map((p, i) => {
                const media = extractMedia(p.result);
                const images = media.images.length ? media.images : (Array.isArray(p.request?.image) ? p.request.image : []);
                const videos = media.videos;
                return (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <div className="text-[9px] text-white/50 mb-1">
                      {new Date(p.at).toLocaleString()} · {p.type?.toUpperCase?.() || p.type}
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
                      {videos.length > 0 ? (
                        <video src={videos[0]} className="w-full h-full object-cover" controls />
                      ) : images.length > 0 ? (
                        <img src={images[0]} className="w-full h-full object-cover" alt="thumb" />
                      ) : (
                        <div className="text-xs text-white/50">미리보기 없음</div>
                      )}
                    </div>
                    {images.length > 1 && (
                      <div className="mt-1 grid grid-cols-4 gap-1">
                        {images.slice(1, 5).map((u: string, idx: number) => (
                          <img key={idx} src={u} className="h-8 w-full object-cover rounded border border-white/10" />
                        ))}
                      </div>
                    )}
                    {p.request?.prompt && (
                      <div className="mt-1 text-[9px] line-clamp-2 text-white/70">{p.request.prompt}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      </div>
    </div>
  );
}
