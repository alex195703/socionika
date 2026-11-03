import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Соціоніка: тренажер — 16 типів",
  description:
    "Ігровий тренажер із соціоніки: 16 типів, дихотомії, функції моделі А, квадри та стосунки між типами. Відгадуй і запам’ятовуй теорію.",
  keywords: ["соціоніка", "типи особистості", "тренажер", "вікторина", "модель А"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
