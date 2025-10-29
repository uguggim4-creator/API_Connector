import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ainspire_내돈내산",
  description: "통합 AI 플랫폼 API 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
