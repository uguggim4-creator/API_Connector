"use client";

import { ReactNode, useState } from "react";
import { Lang, LangContext, translations } from "../lib/i18n";

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ko");
  return (
    <LangContext.Provider value={lang}>
      <div className="w-full flex justify-end p-4">
        <label className="mr-2 text-xs">{translations[lang].selectLang}:</label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
        >
          <option value="ko">{translations[lang].korean}</option>
          <option value="en">{translations[lang].english}</option>
        </select>
      </div>
      {children}
    </LangContext.Provider>
  );
}
