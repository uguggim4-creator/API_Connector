"use client";

import { ReactNode, useState } from "react";
import { Lang, LangContext, translations } from "../lib/i18n";

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ko");
  return (
    <LangContext.Provider value={lang}>
      {children}
      {/* 언어 선택: 레이아웃을 밀지 않도록 고정 위치로 표시 */}
      <div className="fixed top-3 right-3 z-50">
        <label className="mr-2 text-xs hidden sm:inline-block bg-transparent">{translations[lang].selectLang}:</label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="bg-black/70 text-white px-3 py-1 rounded text-xs border border-white/20 backdrop-blur hover:bg-black/80"
        >
          <option value="ko">{translations[lang].korean}</option>
          <option value="en">{translations[lang].english}</option>
        </select>
      </div>
    </LangContext.Provider>
  );
}
