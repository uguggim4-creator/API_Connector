"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
    subtitle: "Nanobanana · Seedream · Midjourney",
    tools: ["Nanobanana", "Seedream", "Midjourney"],
    depth: 14,
  },
  {
    id: "videos",
    title: "비디오 툴",
    subtitle: "Kling · Veo 3.1 · Sora 2 · Midjourney",
    tools: ["Kling", "Veo 3.1", "Sora 2", "Midjourney"],
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

// 요금 정보 타입
interface PricingInfo {
  model: string;
  price: number;
  unit: string;
  description: string;
}

const PRICING: PricingInfo[] = [
  { model: "sora", price: 0.10, unit: "초", description: "Sora 2" },
  { model: "sora-pro", price: 0.30, unit: "초", description: "Sora 2 Pro" },
  { model: "seedream", price: 0.03, unit: "장", description: "Seedream 4.0" },
  { model: "veo-standard", price: 0.40, unit: "초", description: "Veo 3.1 Standard" },
  { model: "veo-fast", price: 0.15, unit: "초", description: "Veo 3.1 Fast" },
  { model: "nanobanana", price: 0.039, unit: "장", description: "Nanobanana" },
  { model: "midjourney", price: 0.04, unit: "장", description: "Midjourney" },
  { model: "kling", price: 0, unit: "초", description: "Kling (가격 미정)" },
];

export default function Home() {
  // Card order state (first index is centered in slider)
  const [order, setOrder] = useState<CardId[]>(["images", "videos", "projects"]);
  const cardMap = useMemo(
    () => Object.fromEntries(initialCards.map((c) => [c.id, c])),
    []
  ) as Record<CardId, CardMeta>;

  // 요금 패널 상태
  const [isPricingOpen, setIsPricingOpen] = useState(false);

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

  // Bring card to center when clicked
  const bringToCenter = (cardId: CardId) => {
    setOrder((prev) => {
      const currentPos = prev.indexOf(cardId);
      if (currentPos === 0) return prev; // already centered
      const next = prev.slice();
      // Move clicked card to front (center)
      next.splice(currentPos, 1);
      next.unshift(cardId);
      return next;
    });
  };

  // Drag & drop (cards reorder) + image cross-banner drag support
  const dragId = useRef<CardId | null>(null);
  const lastAutoMoveAt = useRef<number>(0);
  const DRAG_MIME = "text/uri-list";

  // Drag preview state (follows mouse cursor)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; imageUrl: string } | null>(null);

  // Video modal state
  const [videoModal, setVideoModal] = useState<{ url: string; prompt?: string } | null>(null);

  // Download function for images and videos
  const downloadMedia = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || url.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

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
  const [imgUploadLoading, setImgUploadLoading] = useState(false);
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

  // Seedream 템플릿별 메타데이터
  const seedreamTemplateInfo: Record<string, { imageGuide: string; examplePrompt: string }> = {
    "Mockup": {
      imageGuide: "제품 이미지를 업로드하세요 (배경 제거 권장)",
      examplePrompt: "A clean product mockup on a modern desk setup with natural lighting"
    },
    "Virtual Try-On": {
      imageGuide: "착용할 옷/액세서리 이미지와 모델 사진을 업로드하세요",
      examplePrompt: "A person wearing the uploaded clothing item in a casual setting"
    },
    "Product Photos": {
      imageGuide: "원본 제품 이미지를 업로드하세요",
      examplePrompt: "Professional e-commerce product photo with white background and studio lighting"
    },
    "Storyboarding": {
      imageGuide: "스토리보드 참조 이미지나 스케치를 업로드하세요 (선택)",
      examplePrompt: "Wide shot establishing the location, cinematic framing"
    },
    "Portrait": {
      imageGuide: "인물 사진을 업로드하세요 (얼굴이 잘 보이는 사진)",
      examplePrompt: "Professional headshot with soft natural lighting, sharp focus on eyes"
    },
    "Anime": {
      imageGuide: "참조할 캐릭터나 스타일 이미지를 업로드하세요 (선택)",
      examplePrompt: "Anime character with expressive eyes, dynamic pose, vibrant colors"
    },
    "Fashion": {
      imageGuide: "의상 이미지나 모델 사진을 업로드하세요",
      examplePrompt: "High fashion editorial shot with dramatic lighting and elegant pose"
    },
    "Interior": {
      imageGuide: "인테리어 공간 사진이나 가구 이미지를 업로드하세요 (선택)",
      examplePrompt: "Modern minimalist living room with natural light, Scandinavian style"
    },
    "Food": {
      imageGuide: "음식 사진을 업로드하세요",
      examplePrompt: "Appetizing food photography with garnish, soft shadows, shallow depth of field"
    },
    "Car": {
      imageGuide: "차량 이미지를 업로드하세요",
      examplePrompt: "Luxury car in studio setting with dramatic lighting and reflective floor"
    },
    "Architecture": {
      imageGuide: "건축물 사진이나 스케치를 업로드하세요 (선택)",
      examplePrompt: "Modern architectural design with clean lines, glass facade, golden hour lighting"
    },
    "Illustration": {
      imageGuide: "참조 이미지나 스케치를 업로드하세요 (선택)",
      examplePrompt: "Digital illustration with vibrant colors, detailed textures, artistic composition"
    },
    "UI Mockup": {
      imageGuide: "UI 스크린샷이나 디자인 요소를 업로드하세요 (선택)",
      examplePrompt: "Clean UI design with glassmorphism effects, modern layout, intuitive navigation"
    },
    "Kids Book": {
      imageGuide: "캐릭터 스케치나 참조 이미지를 업로드하세요 (선택)",
      examplePrompt: "Cute children's book illustration with friendly characters, bright colors, simple shapes"
    },
    "Pixel Art": {
      imageGuide: "참조 이미지를 업로드하세요 (선택)",
      examplePrompt: "Retro 8-bit pixel art game character, limited color palette, isometric view"
    },
    "Watercolor": {
      imageGuide: "참조 이미지나 스케치를 업로드하세요 (선택)",
      examplePrompt: "Watercolor painting with soft edges, flowing colors, paper texture"
    },
    "Oil Painting": {
      imageGuide: "참조 사진을 업로드하세요 (선택)",
      examplePrompt: "Classical oil painting with rich textures, impasto technique, dramatic chiaroscuro"
    },
    "3D Render": {
      imageGuide: "3D 모델이나 참조 이미지를 업로드하세요 (선택)",
      examplePrompt: "Photorealistic 3D render with ray tracing, physically based materials, studio lighting"
    },
    "Cinematic": {
      imageGuide: "영화 스틸이나 참조 이미지를 업로드하세요 (선택)",
      examplePrompt: "Cinematic shot with anamorphic bokeh, film grain, moody atmosphere"
    },
    "Photorealistic": {
      imageGuide: "참조 사진을 업로드하세요 (선택)",
      examplePrompt: "Photorealistic image with natural lighting, accurate materials, fine details"
    },
  };

  // 템플릿 변경 시 자동으로 프롬프트 제안
  useEffect(() => {
    if (imgModel === "seedream" && imgTemplate !== "직접 입력") {
      const templateData = seedreamTemplateInfo[imgTemplate];
      if (templateData) {
        // 프롬프트가 비어있거나 이전 템플릿의 예시 프롬프트인 경우 새로운 예시로 교체
        const isEmptyOrExample = !imgPrompt || Object.values(seedreamTemplateInfo).some(t => t.examplePrompt === imgPrompt);
        if (isEmptyOrExample) {
          setImgPrompt(templateData.examplePrompt);
        }
      }
    } else if (imgTemplate === "직접 입력") {
      // "직접 입력"으로 변경 시 예시 프롬프트였다면 지우기
      const isExample = Object.values(seedreamTemplateInfo).some(t => t.examplePrompt === imgPrompt);
      if (isExample) {
        setImgPrompt("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgTemplate, imgModel]);

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

  const generateImages = async () => {
    setImgLoading(true);

    // Add loading placeholder to gallery
    const loadingId = Date.now();
    try {
      const prev = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
      const loadingEntry = {
        type: "image",
        at: loadingId,
        loading: true,
        request: { prompt: imgPrompt },
        result: {}
      };
      prev.unshift(loadingEntry);
      localStorage.setItem("ainspire-results", JSON.stringify(prev));
      setProjects(prev);
    } catch {}

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
      };

      // 모델별 파라미터 설정
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
        body.mode = "FAST"; // FAST 또는 RELAX
      }

      const res = await fetch(`/api/platforms/${imgModel}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      // store to localStorage for Projects and replace loading entry
      try {
        const prev = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
        const withoutLoading = prev.filter((p: any) => p.at !== loadingId);
        const entry = { type: "image", at: Date.now(), request: body, result: data };
        withoutLoading.unshift(entry);
        const next = withoutLoading.slice(0, 50);
        localStorage.setItem("ainspire-results", JSON.stringify(next));
        setProjects(next);
      } catch {}
      alert(data.success ? "이미지 생성 완료" : `실패: ${data.error || "unknown"}`);
    } catch (e) {
      // Remove loading entry on error
      try {
        const prev = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
        const withoutLoading = prev.filter((p: any) => p.at !== loadingId);
        localStorage.setItem("ainspire-results", JSON.stringify(withoutLoading));
        setProjects(withoutLoading);
      } catch {}
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
  const [veoRefUploadLoading, setVeoRefUploadLoading] = useState(false);
  const [veoSourceVideoLoading, setVeoSourceVideoLoading] = useState(false);
  const [veoStartFrameLoading, setVeoStartFrameLoading] = useState(false);
  const [veoEndFrameLoading, setVeoEndFrameLoading] = useState(false);

  // Veo 3.1 template state
  const [veoTemplate, setVeoTemplate] = useState<'text-to-video' | 'reference-images' | 'video-extension' | 'start-end-frame'>('text-to-video');
  const [veoRefImages, setVeoRefImages] = useState<string[]>([]);
  const [veoSourceVideo, setVeoSourceVideo] = useState<string | null>(null);
  const [veoStartFrame, setVeoStartFrame] = useState<string | null>(null);
  const [veoEndFrame, setVeoEndFrame] = useState<string | null>(null);

  const veoTemplates = [
    { value: 'text-to-video', label: '텍스트 to 비디오' },
    { value: 'reference-images', label: '참조 이미지 사용 (최대 3개)' },
    { value: 'video-extension', label: 'Veo 동영상 연장하기' },
    { value: 'start-end-frame', label: '스타트-엔드 프레임' },
  ];

  // Kling state
  const [klingModelName, setKlingModelName] = useState('kling-v2.1-master');
  const [klingMode, setKlingMode] = useState('std');
  const [klingDuration, setKlingDuration] = useState('5');
  const [klingNegativePrompt, setKlingNegativePrompt] = useState('');
  const [klingCfgScale, setKlingCfgScale] = useState(0.5);
  const [klingShowAdvanced, setKlingShowAdvanced] = useState(false);

  // Veo 템플릿 변경 시 자동 설정
  useEffect(() => {
    if (vidModel === 'veo') {
      switch (veoTemplate) {
        case 'text-to-video':
          // 기본 설정
          setVidRes('1280x720');
          setVidSec(8);
          break;
        case 'reference-images':
          // 참조 이미지 사용 시 설정
          setVidRes('1280x720');
          setVidSec(8);
          setVidStart(null);
          setVidEnd(null);
          break;
        case 'video-extension':
          // 동영상 연장 시 설정
          setVidRes('1280x720');
          setVidSec(8);
          setVidStart(null);
          setVidEnd(null);
          setVeoRefImages([]);
          break;
        case 'start-end-frame':
          // 스타트-엔드 프레임 설정
          setVidRes('1280x720');
          setVidSec(8);
          setVidStart(null);
          setVidEnd(null);
          setVeoRefImages([]);
          setVeoSourceVideo(null);
          break;
      }
    }
  }, [veoTemplate, vidModel]);

  const handleSingleImage = async (
    file: File | null,
    setUrl: (u: string) => void,
    setLoading?: (loading: boolean) => void
  ) => {
    if (!file) return;
    const allow = ["image/jpeg", "image/jpg", "image/png"];
    if (!allow.includes(file.type.toLowerCase())) return;
    if (file.size > 10 * 1024 * 1024) return;
    if (setLoading) setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/upload-image", { method: "POST", body: fd });
      const j = await r.json();
      if (j.success && j.url) setUrl(j.url);
    } catch {}
    finally {
      if (setLoading) setLoading(false);
    }
  };

  const handleVeoRefImages = async (files: FileList | null) => {
    if (!files) return;
    setVeoRefUploadLoading(true);
    const allow = ["image/jpeg", "image/jpg", "image/png"];
    for (const f of Array.from(files)) {
      if (!allow.includes(f.type.toLowerCase())) continue;
      if (f.size > 10 * 1024 * 1024) continue;
      if (veoRefImages.length >= 3) {
        alert('최대 3개의 참조 이미지만 업로드할 수 있습니다.');
        break;
      }
      const fd = new FormData();
      fd.append("file", f);
      try {
        const r = await fetch("/api/upload-image", { method: "POST", body: fd });
        const j = await r.json();
        if (j.success && j.url) setVeoRefImages((p) => [...p, j.url]);
      } catch {}
    }
    setVeoRefUploadLoading(false);
  };

  const handleVeoSourceVideo = async (file: File | null) => {
    if (!file) return;
    const allow = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allow.includes(file.type.toLowerCase())) return;
    if (file.size > 100 * 1024 * 1024) return; // 100MB limit
    setVeoSourceVideoLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/upload-image", { method: "POST", body: fd });
      const j = await r.json();
      if (j.success && j.url) setVeoSourceVideo(j.url);
    } catch {}
    finally {
      setVeoSourceVideoLoading(false);
    }
  };

  const generateVideo = async () => {
    setVidLoading(true);

    // Add loading placeholder to gallery
    const loadingId = Date.now();
    try {
      const prev = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
      const loadingEntry = {
        type: "video",
        at: loadingId,
        loading: true,
        request: { prompt: vidPrompt },
        result: {}
      };
      prev.unshift(loadingEntry);
      localStorage.setItem("ainspire-results", JSON.stringify(prev));
      setProjects(prev);
    } catch {}

    try {
      const [w, h] = vidRes.split("x").map((n) => parseInt(n.trim(), 10));
      const body: any = {
        action: "video",
        prompt: vidPrompt,
        duration: Math.max(1, Math.min(60, vidSec)),
        width: isNaN(w) ? 1280 : w,
        height: isNaN(h) ? 720 : h,
      };

      // Veo 3.1 템플릿별 설정
      if (vidModel === "veo") {
        body.template = veoTemplate;

        switch (veoTemplate) {
          case 'text-to-video':
            // 기본 텍스트 to 비디오 - 추가 파라미터 없음
            break;
          case 'reference-images':
            // 참조 이미지 사용
            if (veoRefImages.length > 0) {
              body.referenceImages = veoRefImages;
            }
            break;
          case 'video-extension':
            // 동영상 연장
            if (veoSourceVideo) {
              body.sourceVideo = veoSourceVideo;
            }
            break;
          case 'start-end-frame':
            // 스타트-엔드 프레임
            if (veoStartFrame) {
              body.startFrame = veoStartFrame;
            }
            if (veoEndFrame) {
              body.endFrame = veoEndFrame;
            }
            break;
        }
      } else if (vidModel === "midjourney") {
        // Midjourney 비디오 - 스타트 이미지가 있으면 이미지 URL을 프롬프트에 포함
        if (vidStart) {
          body.prompt = `${vidStart} ${vidPrompt}`;
        }
        body.videoType = "vid_1.1_i2v_480"; // 기본 비디오 타입
        body.mode = "fast";
        body.animateMode = "manual";
      } else if (vidModel === "kling") {
        // Kling - 직접 API 파라미터
        body.model_name = klingModelName;
        body.mode = klingMode;
        body.duration = klingDuration;
        body.cfg_scale = klingCfgScale;
        
        // 이미지 설정
        if (vidStart) body.image = [vidStart];
        if (vidEnd) body.image_tail = vidEnd;
        
        // 네거티브 프롬프트
        if (klingNegativePrompt) {
          body.negative_prompt = klingNegativePrompt;
        }
      } else {
        // 다른 모델 (Sora)
        if (vidStart) body.image = [vidStart];
        if (vidEnd) body.image_end = [vidEnd];
      }

      const modelEndpoint = vidModel === "veo" ? "veo" : vidModel;
      const res = await fetch(`/api/platforms/${modelEndpoint}` , {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      // Replace loading entry with actual result
      try {
        const prev = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
        const withoutLoading = prev.filter((p: any) => p.at !== loadingId);
        const entry = { type: "video", at: Date.now(), request: body, result: data };
        withoutLoading.unshift(entry);
        const next = withoutLoading.slice(0, 50);
        localStorage.setItem("ainspire-results", JSON.stringify(next));
        setProjects(next);
      } catch {}
      alert(data.success ? "비디오 요청 완료" : `실패: ${data.error || "unknown"}`);
    } catch {
      // Remove loading entry on error
      try {
        const prev = JSON.parse(localStorage.getItem("ainspire-results") || "[]");
        const withoutLoading = prev.filter((p: any) => p.at !== loadingId);
        localStorage.setItem("ainspire-results", JSON.stringify(withoutLoading));
        setProjects(withoutLoading);
      } catch {}
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

  // 이번달 사용량 및 요금 계산
  const calculateMonthlyUsage = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const usage: Record<string, { count: number; cost: number; unit: string }> = {};
    let totalCost = 0;

    projects.forEach((p) => {
      const projectDate = new Date(p.at);
      if (projectDate.getMonth() !== thisMonth || projectDate.getFullYear() !== thisYear) {
        return; // 이번달이 아니면 스킵
      }

      if (p.loading) return; // 로딩 중인 항목 제외

      const req = p.request || {};
      let modelKey = "";
      let cost = 0;
      let unit = "";
      let count = 0;

      // 이미지 모델 처리
      if (p.type === "image") {
        const imageCount = parseInt(req.n || "1", 10);
        count = imageCount;

        if (req.model?.includes("seedream")) {
          modelKey = "seedream";
          cost = imageCount * 0.03;
          unit = "장";
        } else if (req.model?.includes("nanobanana")) {
          modelKey = "nanobanana";
          cost = imageCount * 0.039;
          unit = "장";
        } else if (req.mode === "FAST" || req.mode === "RELAX") {
          // Midjourney (mode 파라미터로 판별)
          modelKey = "midjourney";
          cost = imageCount * 0.04;
          unit = "장";
        }
      }
      // 비디오 모델 처리
      else if (p.type === "video") {
        const duration = req.duration || 5;
        count = duration;
        unit = "초";

        // 모델 판별 (API endpoint 기반)
        if (req.model?.includes("veo") || p.result?.model?.includes("veo")) {
          // Veo는 기본적으로 standard로 계산 (fast 구분이 필요하면 추가 로직 필요)
          modelKey = "veo-standard";
          cost = duration * 0.40;
        } else if (req.model?.includes("sora") || p.result?.model?.includes("sora")) {
          // Sora Pro 구분 (필요 시)
          modelKey = "sora";
          cost = duration * 0.10;
        } else if (req.model?.includes("kling")) {
          // Kling은 가격 정보가 없어서 0으로 처리
          modelKey = "kling";
          cost = 0;
        }
      }

      if (modelKey && cost > 0) {
        if (!usage[modelKey]) {
          usage[modelKey] = { count: 0, cost: 0, unit };
        }
        usage[modelKey].count += count;
        usage[modelKey].cost += cost;
        totalCost += cost;
      }
    });

    return { usage, totalCost };
  }, [projects]);

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
    
    // Veo 응답의 video_url 우선 확인 (data.video_url 또는 video_url)
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
          if (isImageUrl(n) && images.length < max) images.push(n);
          else if (isVideoUrl(n) && videos.length < max && !videos.includes(n)) videos.push(n);
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

      {/* 요금 패널 토글 버튼 */}
      <button
        onClick={() => setIsPricingOpen(!isPricingOpen)}
        className="fixed top-24 right-4 z-50 px-4 py-2 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-sm text-white transition-all shadow-lg"
        title="요금 정보"
      >
        💰 요금
      </button>

      {/* 요금 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 z-40 overflow-y-auto ${
          isPricingOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">💰 요금 정보</h2>
            <button
              onClick={() => setIsPricingOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 이번달 총 사용 요금 */}
          <div className="mb-8 p-6 rounded-2xl border-2 border-yellow-500/30 bg-yellow-500/10">
            <div className="text-sm text-yellow-200/80 mb-2">이번달 총 사용액</div>
            <div className="text-4xl font-bold text-yellow-300">
              ${calculateMonthlyUsage.totalCost.toFixed(3)}
            </div>
            <div className="text-xs text-yellow-200/60 mt-2">
              {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
            </div>
          </div>

          {/* 모델별 사용량 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-white/90">모델별 사용량</h3>
            {Object.keys(calculateMonthlyUsage.usage).length === 0 ? (
              <div className="text-sm text-white/40 text-center py-8">
                이번달 사용 내역이 없습니다
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(calculateMonthlyUsage.usage).map(([modelKey, data]) => {
                  const pricingInfo = PRICING.find(p => p.model === modelKey);
                  return (
                    <div
                      key={modelKey}
                      className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">
                          {pricingInfo?.description || modelKey}
                        </span>
                        <span className="text-lg font-bold text-green-400">
                          ${data.cost.toFixed(3)}
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        {data.count} {data.unit} × ${pricingInfo?.price || 0}/{data.unit}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 요금표 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white/90">요금표</h3>
            <div className="space-y-2">
              {PRICING.map((pricing) => (
                <div
                  key={pricing.model}
                  className="p-3 rounded-lg border border-white/10 bg-white/5 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white/90">{pricing.description}</span>
                    <span className="text-blue-300 font-mono">
                      ${pricing.price.toFixed(3)}
                    </span>
                  </div>
                  <div className="text-xs text-white/50">per {pricing.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 참고 사항 */}
          <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5 text-xs text-white/60">
            <div className="font-medium text-white/80 mb-2">💡 참고사항</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>요금은 localStorage 기록 기반으로 계산됩니다</li>
              <li>브라우저 캐시 삭제 시 기록이 초기화됩니다</li>
              <li>실제 청구 금액은 API 제공업체에서 확인하세요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">

      <div className="container mx-auto px-4 py-10">
        <header className="flex items-center justify-between mb-24">
          <h1 className="text-lg font-semibold tracking-tight">ainspire_내돈내산</h1>
          <div className="text-xs text-white/60 font-mono">
            Powered by CometAPI
          </div>
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
                  onClick={() => {
                    if (pos !== 0) {
                      bringToCenter(card.id);
                    }
                  }}
                  className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none cursor-grab active:cursor-grabbing rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden w-[82%] md:w-[66%] lg:w-[58%] h-full will-change-transform"
                  style={{
                    transform: `translate3d(calc(-50% + ${baseX + tx}px), calc(-50% + ${ty}px), 0) scale(${baseScale})`,
                    transition: "transform 280ms cubic-bezier(.2,.8,.2,1)",
                    zIndex: z,
                    cursor: pos !== 0 ? "pointer" : "grab",
                  }}
                  onDragOver={(e) => {
                    // While dragging an image, hovering a side card auto-centers it
                    if (!isImageDrag(e.dataTransfer)) return;
                    const now = Date.now();
                    if (now - lastAutoMoveAt.current < 600) return;
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
                        {/* 모델 / 비율 / 개수 / 템플릿 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <div className="mb-1 text-gray-300">모델</div>
                            <select value={imgModel} onChange={(e) => setImgModel(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2">
                              <option value="seedream">Seedream 4.0</option>
                              <option value="nanobanana">Nanobanana</option>
                              <option value="midjourney">Midjourney</option>
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

                        {/* 템플릿 가이드 메시지 */}
                        {imgModel === "seedream" && imgTemplate !== "직접 입력" && seedreamTemplateInfo[imgTemplate] && (
                          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">💡</div>
                              <div className="flex-1">
                                <div className="font-medium text-blue-300 mb-1">템플릿 가이드: {imgTemplate}</div>
                                <div className="text-sm text-blue-200/80">{seedreamTemplateInfo[imgTemplate].imageGuide}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 첨부 이미지 */}
                        <div>
                          <div className="mb-2 font-medium flex items-center justify-between">
                            <span>첨부 이미지</span>
                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed">
                              {imgUploadLoading ? "업로드 중..." : "업로드"}
                              <input type="file" accept="image/jpeg,image/jpg,image/png" multiple className="hidden" onChange={(e) => handleImageFiles(e.target.files)} disabled={imgUploadLoading} />
                            </label>
                          </div>
                          <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6">
                            {imgUploadLoading && (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                              </div>
                            )}
                            {imgRefs.length > 0 && (
                              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                {imgRefs.map((u, i) => (
                                  <img
                                    key={i}
                                    src={u}
                                    alt="ref"
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData(DRAG_MIME, u);
                                      e.dataTransfer.effectAllowed = "copy";
                                      // Set drag preview to follow cursor
                                      setDragPreview({ x: e.clientX, y: e.clientY, imageUrl: u });
                                      // Hide default drag image
                                      const emptyImg = new Image();
                                      emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                      e.dataTransfer.setDragImage(emptyImg, 0, 0);
                                    }}
                                    onDrag={(e) => {
                                      if (e.clientX !== 0 && e.clientY !== 0) {
                                        setDragPreview((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                                      }
                                    }}
                                    onDragEnd={() => {
                                      setDragPreview(null);
                                    }}
                                    className="aspect-square w-full object-cover rounded-md border border-white/15 cursor-grab active:cursor-grabbing"
                                  />
                                ))}
                              </div>
                            )}
                            {!imgUploadLoading && imgRefs.length === 0 && (
                              <div className="text-center text-white/40 py-4">이미지를 업로드하세요</div>
                            )}
                          </div>
                        </div>

                        {/* 프롬프트 */}
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-gray-300">프롬프트</span>
                            {imgModel === "seedream" && imgTemplate !== "직접 입력" && seedreamTemplateInfo[imgTemplate] && (
                              <button
                                onClick={() => setImgPrompt(seedreamTemplateInfo[imgTemplate].examplePrompt)}
                                className="text-xs px-3 py-1 rounded-lg border border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/20 transition-colors"
                              >
                                ✨ 예시 프롬프트 사용
                              </button>
                            )}
                          </div>
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
                        {/* 모델 선택 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <div className="mb-1 text-gray-300">모델</div>
                            <select value={vidModel} onChange={(e) => setVidModel(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2">
                              <option value="kling">Kling</option>
                              <option value="veo">Veo 3.1</option>
                              <option value="sora">Sora 2</option>
                              <option value="midjourney">Midjourney</option>
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

                        {/* Veo 3.1 템플릿 선택 */}
                        {vidModel === "veo" && (
                          <div>
                            <div className="mb-1 text-gray-300">템플릿</div>
                            <select value={veoTemplate} onChange={(e) => setVeoTemplate(e.target.value as any)} className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2">
                              {veoTemplates.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Kling 전용 파라미터 */}
                        {vidModel === "kling" && (
                          <div className="space-y-4 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-purple-300">⚙️ Kling 설정</h4>
                              <button
                                onClick={() => setKlingShowAdvanced(!klingShowAdvanced)}
                                className="text-xs px-3 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
                              >
                                {klingShowAdvanced ? "기본 옵션" : "고급 옵션"}
                              </button>
                            </div>

                            {/* 기본 옵션 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <div className="mb-1 text-gray-300 text-sm">모델</div>
                                <select
                                  value={klingModelName}
                                  onChange={(e) => setKlingModelName(e.target.value)}
                                  className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2 text-sm"
                                >
                                  <option value="kling-v2.1-master">Kling v2.1 Master</option>
                                  <option value="kling-v2.1-standard">Kling v2.1 Standard</option>
                                  <option value="kling-v2.1-fast">Kling v2.1 Fast</option>
                                  <option value="kling-v2-master">Kling v2 Master</option>
                                  <option value="kling-v2-standard">Kling v2 Standard</option>
                                  <option value="kling-v1.6-master">Kling v1.6 Master</option>
                                  <option value="kling-v1.6-standard">Kling v1.6 Standard</option>
                                </select>
                              </div>
                              <div>
                                <div className="mb-1 text-gray-300 text-sm">모드</div>
                                <select
                                  value={klingMode}
                                  onChange={(e) => setKlingMode(e.target.value)}
                                  className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2 text-sm"
                                >
                                  <option value="std">Standard</option>
                                  <option value="pro">Pro</option>
                                </select>
                              </div>
                              <div>
                                <div className="mb-1 text-gray-300 text-sm">영상 길이</div>
                                <select
                                  value={klingDuration}
                                  onChange={(e) => setKlingDuration(e.target.value)}
                                  className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-2 text-sm"
                                >
                                  <option value="5">5초</option>
                                  <option value="10">10초</option>
                                </select>
                              </div>
                            </div>

                            {/* 고급 옵션 */}
                            {klingShowAdvanced && (
                              <div className="space-y-4 pt-4 border-t border-purple-500/20">
                                {/* CFG Scale */}
                                <div>
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">CFG Scale</span>
                                    <span className="text-purple-300 text-sm font-mono">{klingCfgScale.toFixed(2)}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={klingCfgScale}
                                    onChange={(e) => setKlingCfgScale(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0.0</span>
                                    <span className="text-gray-400">프롬프트 충실도 조절</span>
                                    <span>1.0</span>
                                  </div>
                                </div>

                                {/* Negative Prompt */}
                                <div>
                                  <div className="mb-1 text-gray-300 text-sm">네거티브 프롬프트</div>
                                  <textarea
                                    value={klingNegativePrompt}
                                    onChange={(e) => setKlingNegativePrompt(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-white/15 bg-black/40 text-white p-3 text-sm"
                                    placeholder="원하지 않는 요소를 설명하세요 (예: blurry, low quality, distorted)"
                                  />
                                </div>

                                {/* 추가 기능 안내 */}
                                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                                  <div className="text-xs text-blue-300 font-medium mb-1">🔜 준비 중인 기능</div>
                                  <div className="text-xs text-blue-200/70">
                                    • Static Mask - 특정 영역 고정<br/>
                                    • Dynamic Masks - 움직임 경로 지정<br/>
                                    • Camera Control - 카메라 움직임 제어
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Veo 3.1: 텍스트 to 비디오 */}
                        {vidModel === "veo" && veoTemplate === "text-to-video" && (
                          <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                            <div className="text-xs text-gray-400 mb-2">
                              📝 텍스트 프롬프트만으로 비디오를 생성합니다.
                            </div>
                          </div>
                        )}

                        {/* Veo 3.1: 참조 이미지 사용 */}
                        {vidModel === "veo" && veoTemplate === "reference-images" && (
                          <div>
                            <div className="mb-2 font-medium">참조 이미지 (최대 3개)</div>
                            <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6">
                              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 cursor-pointer text-white disabled:opacity-50">
                                {veoRefUploadLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    업로드 중...
                                  </>
                                ) : (
                                  "업로드"
                                )}
                                <input type="file" accept="image/jpeg,image/jpg,image/png" multiple className="hidden" onChange={(e) => handleVeoRefImages(e.target.files)} disabled={veoRefUploadLoading} />
                              </label>
                              <div className="mt-2 text-xs text-gray-400">
                                드레스, 선글라스, 인물 등 비디오에 포함시킬 요소의 이미지를 업로드하세요.
                              </div>
                              {veoRefImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  {veoRefImages.map((u, i) => (
                                    <div key={i} className="relative">
                                      <img src={u} alt={`ref-${i}`} className="h-24 w-full object-cover rounded-md border border-white/15" />
                                      <button
                                        onClick={() => setVeoRefImages(veoRefImages.filter((_, idx) => idx !== i))}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Veo 3.1: 동영상 연장 */}
                        {vidModel === "veo" && veoTemplate === "video-extension" && (
                          <div>
                            <div className="mb-2 font-medium">소스 비디오</div>
                            <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6">
                              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 cursor-pointer text-white disabled:opacity-50">
                                {veoSourceVideoLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    업로드 중...
                                  </>
                                ) : (
                                  "업로드"
                                )}
                                <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => handleVeoSourceVideo(e.target.files?.[0] || null)} disabled={veoSourceVideoLoading} />
                              </label>
                              <div className="mt-2 text-xs text-gray-400">
                                연장할 Veo 비디오를 업로드하세요. 프롬프트에 다음 장면을 설명하세요.
                              </div>
                              {veoSourceVideo && (
                                <div className="mt-4">
                                  <video src={veoSourceVideo} className="h-32 rounded-md border border-white/15" controls />
                                  <button
                                    onClick={() => setVeoSourceVideo(null)}
                                    className="mt-2 text-xs text-red-400 hover:text-red-300"
                                  >
                                    제거
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Veo 3.1: 스타트-엔드 프레임 */}
                        {vidModel === "veo" && veoTemplate === "start-end-frame" && (
                          <div>
                            <div className="mb-2 font-medium">스타트 & 엔드 프레임</div>
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
                                  if (url) setVeoStartFrame(url);
                                }}
                              >
                                <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6">
                                  <div className="mb-2 text-sm font-medium">스타트 프레임</div>
                                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 cursor-pointer text-white disabled:opacity-50">
                                    {veoStartFrameLoading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        업로드 중...
                                      </>
                                    ) : (
                                      "업로드"
                                    )}
                                    <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={(e) => handleSingleImage(e.target.files?.[0] || null, (u) => setVeoStartFrame(u), setVeoStartFrameLoading)} disabled={veoStartFrameLoading} />
                                  </label>
                                  {veoStartFrame && (
                                    <div className="mt-4 relative">
                                      <img src={veoStartFrame} alt="start-frame" className="h-32 w-full object-cover rounded-md border border-white/15" />
                                      <button
                                        onClick={() => setVeoStartFrame(null)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )}
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
                                  if (url) setVeoEndFrame(url);
                                }}
                              >
                                <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6">
                                  <div className="mb-2 text-sm font-medium">엔드 프레임</div>
                                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 cursor-pointer text-white disabled:opacity-50">
                                    {veoEndFrameLoading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        업로드 중...
                                      </>
                                    ) : (
                                      "업로드"
                                    )}
                                    <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={(e) => handleSingleImage(e.target.files?.[0] || null, (u) => setVeoEndFrame(u), setVeoEndFrameLoading)} disabled={veoEndFrameLoading} />
                                  </label>
                                  {veoEndFrame && (
                                    <div className="mt-4 relative">
                                      <img src={veoEndFrame} alt="end-frame" className="h-32 w-full object-cover rounded-md border border-white/15" />
                                      <button
                                        onClick={() => setVeoEndFrame(null)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                              비디오의 첫 프레임과 마지막 프레임을 지정하여 그 사이를 보간합니다.
                            </div>
                          </div>
                        )}

                        {/* Kling/Sora: 스타트/엔드 이미지 */}
                        {vidModel !== "veo" && (
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
                        )}

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
                          <div className="grid grid-cols-1 gap-4">
                            {projects.map((p, i) => {
                              const copyToClipboard = (text: string) => {
                                navigator.clipboard.writeText(text).then(() => {
                                  alert('클립보드에 복사되었습니다!');
                                }).catch(() => {
                                  alert('복사 중 오류가 발생했습니다.');
                                });
                              };

                              return (
                                <div key={i} className="rounded-xl border border-white/15 bg-white/10 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <div className="text-xs text-gray-300">{new Date(p.at).toLocaleString()}</div>
                                      <div className="font-medium text-base">{p.type?.toUpperCase?.() || p.type}</div>
                                    </div>
                                  </div>

                                  {/* 요청 JSON */}
                                  <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold text-green-300">📤 요청 (Request)</span>
                                      <button
                                        onClick={() => copyToClipboard(JSON.stringify(p.request, null, 2))}
                                        className="px-2 py-1 text-xs rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 transition-colors"
                                        title="복사"
                                      >
                                        복사
                                      </button>
                                    </div>
                                    <pre className="text-xs overflow-auto max-h-48 p-3 rounded-lg bg-black/40 border border-white/10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                      {JSON.stringify(p.request, null, 2)}
                                    </pre>
                                  </div>

                                  {/* 응답 JSON */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold text-blue-300">📥 응답 (Response)</span>
                                      <button
                                        onClick={() => copyToClipboard(JSON.stringify(p.result, null, 2))}
                                        className="px-2 py-1 text-xs rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-colors"
                                        title="복사"
                                      >
                                        복사
                                      </button>
                                    </div>
                                    <pre className="text-xs overflow-auto max-h-48 p-3 rounded-lg bg-black/40 border border-white/10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                      {JSON.stringify(p.result?.data || p.result, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              );
                            })}
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
                const isLoading = p.loading === true;

                return (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-2 group relative">
                    <div className="text-[9px] text-white/50 mb-1">
                      {new Date(p.at).toLocaleString()} · {p.type?.toUpperCase?.() || p.type}
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden bg-black/40 flex items-center justify-center relative">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          <div className="text-[9px] text-white/50">생성 중...</div>
                        </div>
                      ) : videos.length > 0 ? (
                        <>
                          <video
                            src={videos[0]}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setVideoModal({ url: videos[0], prompt: p.request?.prompt })}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/60 rounded-full p-3">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                              </svg>
                            </div>
                          </div>
                        </>
                      ) : images.length > 0 ? (
                        <img src={images[0]} className="w-full h-full object-cover" alt="thumb" />
                      ) : (
                        <div className="text-xs text-white/50">미리보기 없음</div>
                      )}
                    </div>
                    {/* Download button */}
                    {!isLoading && (videos.length > 0 || images.length > 0) && (
                      <button
                        onClick={() => {
                          const url = videos.length > 0 ? videos[0] : images[0];
                          downloadMedia(url, `ainspire-${p.type}-${p.at}`);
                        }}
                        className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="다운로드"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    )}
                    {!isLoading && images.length > 1 && (
                      <div className="mt-1 grid grid-cols-4 gap-1">
                        {images.slice(1, 5).map((u: string, idx: number) => (
                          <div key={idx} className="relative group/img">
                            <img src={u} className="h-8 w-full object-cover rounded border border-white/10" />
                            <button
                              onClick={() => downloadMedia(u, `ainspire-${p.type}-${p.at}-${idx + 1}`)}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                              title="다운로드"
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
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

      {/* Drag preview that follows mouse cursor */}
      {dragPreview && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragPreview.x,
            top: dragPreview.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src={dragPreview.imageUrl}
            alt="drag preview"
            className="w-24 h-24 object-cover rounded-lg border-2 border-white/50 shadow-2xl opacity-90"
          />
        </div>
      )}

      {/* Video modal */}
      {videoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVideoModal(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-black/90 rounded-2xl border border-white/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setVideoModal(null)}
              className="absolute top-4 right-4 z-10 bg-black/80 hover:bg-black text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Download button */}
            <button
              onClick={() => downloadMedia(videoModal.url, `ainspire-video-${Date.now()}`)}
              className="absolute top-4 right-16 z-10 bg-black/80 hover:bg-black text-white rounded-full p-2 transition-colors"
              title="다운로드"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            {/* Video player */}
            <video
              src={videoModal.url}
              className="w-full"
              controls
              autoPlay
            />

            {/* Prompt text */}
            {videoModal.prompt && (
              <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="text-xs text-white/50 mb-1">프롬프트</div>
                <div className="text-sm text-white">{videoModal.prompt}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
