import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EX Open Posts",
  description: "サンプルの投稿アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
