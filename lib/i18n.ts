import { createContext, useContext } from "react";

export type Lang = "ko" | "en";

export const translations = {
  ko: {
    gallery: "AI 결과 갤러리",
    prompts: "프롬프트 마켓 / 추천 프롬프트",
    feedback: "AI 영상 피드백 / 프롬프트 개선",
    credit: "크레딧",
    like: "좋아요",
    comment: "댓글",
    copyPrompt: "프롬프트 복사",
    leaveFeedback: "피드백 남기기",
    adopted: "채택됨 +크레딧",
    author: "작성자",
    tags: "태그",
    category: "카테고리",
    selectLang: "언어 선택",
    korean: "한국어",
    english: "영어",
  },
  en: {
    gallery: "AI Gallery",
    prompts: "Prompt Market / Recommended Prompts",
    feedback: "AI Video Feedback / Prompt Improvement",
    credit: "Credit",
    like: "Like",
    comment: "Comment",
    copyPrompt: "Copy Prompt",
    leaveFeedback: "Leave Feedback",
    adopted: "Adopted +Credit",
    author: "Author",
    tags: "Tags",
    category: "Category",
    selectLang: "Select Language",
    korean: "Korean",
    english: "English",
  },
};

export const LangContext = createContext<Lang>("ko");
export const useLang = () => useContext(LangContext);
export const t = (lang: Lang, key: keyof typeof translations["ko"]) => translations[lang][key];
