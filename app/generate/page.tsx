"use client";

import { useState } from "react";

type ToolType = "image" | "video";

export default function GeneratePage() {
  const [selectedTool, setSelectedTool] = useState<ToolType>("image");
  const [results, setResults] = useState<any[]>([]);

  // 이미지 툴 상태
  const [imgModel, setImgModel] = useState("seedream");
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgRatio, setImgRatio] = useState("1:1");
  const [imgCount, setImgCount] = useState<string>("1");
  const [imgTemplate, setImgTemplate] = useState("직접 입력");
  const [imgRefs, setImgRefs] = useState<string[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgUploadLoading, setImgUploadLoading] = useState(false);

  // 비디오 툴 상태
  const [vidModel, setVidModel] = useState("kling");
  const [vidPrompt, setVidPrompt] = useState("");
  const [vidRes, setVidRes] = useState("1280x720");
  const [vidSec, setVidSec] = useState(5);
  const [vidStart, setVidStart] = useState<string | null>(null);
  const [vidEnd, setVidEnd] = useState<string | null>(null);
  const [vidLoading, setVidLoading] = useState(false);

  const seedreamTemplates = [
    "직접 입력",
    "Mockup",
    "Virtual Try-On",
    "Product Photos",
    "Portrait",
    "Anime",
    "Fashion",
    "Interior",
    "Food",
  ];

  const ratioMap: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },
    "4:3": { width: 1152, height: 864 },
    "3:4": { width: 864, height: 1152 },
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files) return;
    setImgUploadLoading(true);
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
    setImgUploadLoading(false);
  };

  const handleSingleImage = async (file: File | null, setUrl: (u: string) => void) => {
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

  const generateImages = async () => {
    setImgLoading(true);
    try {
      const r = ratioMap[imgRatio] || ratioMap["1:1"];
      const parsedCount = Math.max(1, Math.min(4, parseInt(imgCount || "1", 10) || 1));
      const body: any = {
        action: "image",
        prompt: imgPrompt,
      };

      if (imgModel === "seedream") {
        body.model = "seedream-4-0-250828";
        body.width = r.width;
        body.height = r.height;
        body.response_format = "url";
        body.n = parsedCount;
        body.watermark = false;
        if (imgRefs.length) body.image = imgRefs;
      } else if (imgModel === "nanobanana") {
        body.width = r.width;
        body.height = r.height;
        body.n = parsedCount;
      } else if (imgModel === "midjourney") {
        body.mode = "FAST";
      }

      const res = await fetch(`/api/platforms/${imgModel}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      if (data.success) {
        setResults((prev) => [{ type: "image", data, timestamp: Date.now() }, ...prev]);
        alert("이미지 생성 완료");
      } else {
        alert(`실패: ${data.error || "unknown"}`);
      }
    } catch (e) {
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setImgLoading(false);
    }
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

      if (vidModel === "kling") {
        body.model_name = "kling-v2.1-master";
        body.mode = "std";
        body.duration = "5";
        body.cfg_scale = 0.5;
        if (vidStart) body.image = [vidStart];
        if (vidEnd) body.image_tail = vidEnd;
      } else if (vidModel === "veo") {
        body.template = "text-to-video";
      } else if (vidModel === "sora") {
        if (vidStart) body.image = [vidStart];
        if (vidEnd) body.image_end = [vidEnd];
      }

      const res = await fetch(`/api/platforms/${vidModel}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      if (data.success) {
        setResults((prev) => [{ type: "video", data, timestamp: Date.now() }, ...prev]);
        alert("비디오 요청 완료");
      } else {
        alert(`실패: ${data.error || "unknown"}`);
      }
    } catch {
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setVidLoading(false);
    }
  };

  // 결과물에서 미디어 추출
  const extractMedia = (obj: any): { images: string[]; videos: string[] } => {
    const images: string[] = [];
    const videos: string[] = [];
    
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

    if (obj?.data?.video_url && isVideoUrl(obj.data.video_url)) {
      videos.push(obj.data.video_url);
    } else if (obj?.video_url && isVideoUrl(obj.video_url)) {
      videos.push(obj.video_url);
    }
    
    const seen = new Set<any>();
    function walk(n: any, depth: number) {
      if (!n || depth > 6 || seen.has(n)) return;
      if (typeof n === "string") {
        if (looksLikeUrl(n)) {
          if (isImageUrl(n) && images.length < 12) images.push(n);
          else if (isVideoUrl(n) && videos.length < 12 && !videos.includes(n)) videos.push(n);
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
  };

  return (
    <>
      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-black"
        style={{
          backgroundImage: "url('/background.jpg')",
          opacity: 0.95,
        }}
      />

      <div className="min-h-screen text-white relative z-10">
        {/* 헤더 */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <a href="/" className="text-lg font-semibold tracking-tight text-white">
                  ainspire_내돈내산
                </a>
                <nav className="flex items-center gap-6">
                  <a href="/generate" className="text-sm text-white font-semibold">
                    생성
                  </a>
                  <a href="/" className="text-sm text-white/80 hover:text-white transition-colors">
                    프로젝트
                  </a>
                  <button 
                    className="text-sm text-white/80 hover:text-white transition-colors"
                    disabled
                    title="준비 중"
                  >
                    EXPLORE
                  </button>
                </nav>
              </div>
              <nav className="flex items-center gap-6">
                <a 
                  href="/#pricing-section" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/";
                    setTimeout(() => {
                      const pricingSection = document.getElementById('pricing-section');
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  요금
                </a>
                <a href="mailto:contact@ainspire.com" className="text-sm text-white/80 hover:text-white transition-colors">
                  문의하기
                </a>
                <button className="px-4 py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-sm text-white transition-colors">
                  로그인
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <div className="flex gap-0 h-[calc(100vh-80px)]">
          {/* 좌측: 설정 패널 - 왼쪽 끝에 붙이기 */}
          <div className="w-[360px] flex-shrink-0 border-r border-white/10 bg-black/50 backdrop-blur-xl overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* 툴 선택 탭 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTool("image")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    selectedTool === "image"
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
                >
                  이미지
                </button>
                <button
                  onClick={() => setSelectedTool("video")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    selectedTool === "video"
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/70 hover:bg-white/15"
                  }`}
                >
                  비디오
                </button>
              </div>

              {/* 이미지 툴 설정 */}
              {selectedTool === "image" && (
                <div className="space-y-5">
                  {/* 모델 선택 */}
                  <div>
                    <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Model</label>
                    <select
                      value={imgModel}
                      onChange={(e) => setImgModel(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 text-white p-2.5 text-sm"
                    >
                      <option value="seedream">Seedream 4.0</option>
                      <option value="nanobanana">Nanobanana</option>
                      <option value="midjourney">Midjourney</option>
                    </select>
                  </div>

                  {/* 템플릿 (Seedream) */}
                  {imgModel === "seedream" && (
                    <div>
                      <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Template</label>
                      <select
                        value={imgTemplate}
                        onChange={(e) => setImgTemplate(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/5 text-white p-2.5 text-sm"
                      >
                        {seedreamTemplates.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 해상도 비율 & 개수 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Ratio</label>
                      <select
                        value={imgRatio}
                        onChange={(e) => setImgRatio(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/5 text-white p-2.5 text-sm"
                      >
                        {Object.keys(ratioMap).map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Count</label>
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={imgCount}
                        onChange={(e) => setImgCount(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/5 text-white p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Reference Images */}
                  <div>
                    <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Reference Images</label>
                    <div className="rounded-lg border-2 border-dashed border-white/20 bg-white/5 p-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                          onChange={(e) => handleImageFiles(e.target.files)}
                        />
                        <div className="text-center text-white/60 text-sm">
                          {imgUploadLoading ? "업로드 중..." : "+ 이미지 추가 (최대 10MB)"}
                        </div>
                      </label>
                      {imgRefs.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {imgRefs.map((url, i) => (
                            <div key={i} className="relative group">
                              <img src={url} alt="ref" className="w-full aspect-square object-cover rounded" />
                              <button
                                onClick={() => setImgRefs((prev) => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 프롬프트 */}
                  <div>
                    <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Prompt</label>
                    <textarea
                      value={imgPrompt}
                      onChange={(e) => setImgPrompt(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-white/20 bg-white/5 text-white p-3 text-sm"
                      placeholder="이미지 설명을 입력하세요..."
                    />
                  </div>

                  {/* Generate 버튼 */}
                  <button
                    onClick={generateImages}
                    disabled={imgLoading || !imgPrompt}
                    className="w-full py-3.5 rounded-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-wide shadow-lg shadow-yellow-500/50"
                  >
                    {imgLoading ? "생성 중..." : "Generate"}
                  </button>
                </div>
              )}

              {/* 비디오 툴 설정 */}
              {selectedTool === "video" && (
                <div className="space-y-5">
                  {/* 모델 선택 */}
                  <div>
                    <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Model</label>
                    <select
                      value={vidModel}
                      onChange={(e) => setVidModel(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 text-white p-2.5 text-sm"
                    >
                      <option value="kling">Kling</option>
                      <option value="veo">Veo 3.1</option>
                      <option value="sora">Sora 2</option>
                    </select>
                  </div>

                  {/* 해상도 & 길이 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Resolution</label>
                      <select
                        value={vidRes}
                        onChange={(e) => setVidRes(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/5 text-white p-2.5 text-sm"
                      >
                        <option value="1280x720">1280x720</option>
                        <option value="1920x1080">1920x1080</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Duration (s)</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={vidSec}
                        onChange={(e) => setVidSec(parseInt(e.target.value))}
                        className="w-full rounded-lg border border-white/20 bg-white/5 text-white p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Start/End Frame */}
                  <div>
                    <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Frame Control (Optional)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-white/40 mb-1.5">Start Frame</div>
                        <label className="cursor-pointer block">
                          <div className="rounded-lg border-2 border-dashed border-white/20 bg-white/5 p-3 text-center">
                            {!vidStart && (
                              <div className="text-white/60 text-xs mb-2">
                                + 이미지 추가
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              className="hidden"
                              onChange={(e) => handleSingleImage(e.target.files?.[0] || null, (u) => setVidStart(u))}
                            />
                            {vidStart && <img src={vidStart} alt="start" className="w-full aspect-video object-cover rounded" />}
                          </div>
                        </label>
                      </div>
                      <div>
                        <div className="text-xs text-white/40 mb-1.5">End Frame</div>
                        <label className="cursor-pointer block">
                          <div className="rounded-lg border-2 border-dashed border-white/20 bg-white/5 p-3 text-center">
                            {!vidEnd && (
                              <div className="text-white/60 text-xs mb-2">
                                + 이미지 추가
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              className="hidden"
                              onChange={(e) => handleSingleImage(e.target.files?.[0] || null, (u) => setVidEnd(u))}
                            />
                            {vidEnd && <img src={vidEnd} alt="end" className="w-full aspect-video object-cover rounded" />}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 프롬프트 */}
                  <div>
                    <label className="text-xs text-white/60 mb-2 block uppercase tracking-wide font-medium">Prompt</label>
                    <textarea
                      value={vidPrompt}
                      onChange={(e) => setVidPrompt(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-white/20 bg-white/5 text-white p-3 text-sm"
                      placeholder="비디오 설명을 입력하세요..."
                    />
                  </div>

                  {/* Generate 버튼 */}
                  <button
                    onClick={generateVideo}
                    disabled={vidLoading || !vidPrompt}
                    className="w-full py-3.5 rounded-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-wide shadow-lg shadow-yellow-500/50"
                  >
                    {vidLoading ? "생성 중..." : "Generate"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 우측: 결과물 표시 영역 - 세로 스크롤 갤러리 */}
          <div className="flex-1 bg-black overflow-y-auto">
            {results.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[calc(100vh-80px)]">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <div className="text-xl text-white/70 mb-2">아직 생성된 결과가 없습니다</div>
                  <div className="text-sm text-white/40">좌측 패널에서 설정을 완료하고 생성 버튼을 클릭하세요</div>
                </div>
              </div>
            ) : (
              <div className="p-8 space-y-6">
                {results.map((result, idx) => {
                  const media = extractMedia(result.data);
                  return (
                    <div key={idx} className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-white/40 transition-all">
                      {/* 미디어 표시 */}
                      <div className="w-full bg-black/60 relative">
                        {media.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 p-2">
                            {media.images.slice(0, 4).map((img, i) => (
                              <img 
                                key={i}
                                src={img} 
                                alt={`result-${i}`} 
                                className="w-full aspect-square object-cover rounded-lg hover:scale-105 transition-transform duration-300" 
                              />
                            ))}
                          </div>
                        )}
                        {media.videos.length > 0 && (
                          <video 
                            src={media.videos[0]} 
                            className="w-full max-h-[600px] object-contain" 
                            controls 
                          />
                        )}
                        {media.images.length === 0 && media.videos.length === 0 && (
                          <div className="flex items-center justify-center h-64 text-white/40">
                            결과 없음
                          </div>
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="p-4 bg-white/5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-white/50">
                            {new Date(result.timestamp).toLocaleString()}
                          </div>
                          <div className="text-xs text-white/70 uppercase font-medium px-3 py-1 rounded-full bg-white/10">
                            {result.type}
                          </div>
                        </div>
                        {media.images.length > 4 && (
                          <div className="mt-2 text-xs text-white/60">
                            +{media.images.length - 4} more images
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
