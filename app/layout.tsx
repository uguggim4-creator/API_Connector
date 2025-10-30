import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import LanguageProvider from "../components/LanguageProvider";

export const metadata: Metadata = {
  title: "AInspire",
  description: "통합 AI 플랫폼 API 관리 시스템",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
