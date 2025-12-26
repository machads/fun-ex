import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "株式会社ファンエクス | FunEx Inc.",
  description: "株式会社ファンエクスの公式サイトです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
