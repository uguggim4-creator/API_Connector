import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import LanguageProvider from "../components/LanguageProvider";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "AInspire",
  description: "통합 AI 플랫폼 API 관리 시스템",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {/* Global background */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/background.jpg')", opacity: 0.95 }}
        />
        <LanguageProvider>
          <Header />
          <main className="min-h-screen text-white relative z-10">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
