import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Соционика: тренажёр — 16 типов",
  description:
    "Игровой тренажёр по соционике: 16 типов, дихотомии, функции модели А, квадры и отношения. Угадывай и запоминай теорию.",
  keywords: ["соционика", "типы личности", "тренажёр", "викторина", "модель А"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
