import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Content Hub — AI Collaboration Platform",
  description: "Optimistic UX + Server-first + Real-time feel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  );
}
