import type { Metadata } from "next";
import "./globals.css";
import { ReactNode, useState } from "react";
import { LangContext, translations } from "../lib/i18n";

export const metadata: Metadata = {
  title: "AInspire",
  description: "통합 AI 플랫폼 API 관리 시스템",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<"ko" | "en">("ko");
  return (
    <LangContext.Provider value={lang}>
      <html lang={lang}>
        <body className="antialiased">
          <div className="w-full flex justify-end p-4">
            <label className="mr-2 text-xs">{translations[lang].selectLang}:</label>
            <select value={lang} onChange={e => setLang(e.target.value as "ko" | "en")}
              className="bg-gray-800 text-white px-2 py-1 rounded text-xs">
              <option value="ko">{translations[lang].korean}</option>
              <option value="en">{translations[lang].english}</option>
            </select>
          </div>
          {children}
        </body>
      </html>
    </LangContext.Provider>
  );
}
