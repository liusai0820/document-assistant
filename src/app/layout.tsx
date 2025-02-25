import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "公文写作助手",
  description: "专业的公文写作辅助工具，帮助您快速生成高质量的公文、报告和其他文档",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
