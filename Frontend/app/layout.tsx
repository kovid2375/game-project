import type { Metadata } from "next";
import { Bebas_Neue, Special_Elite, Inter, Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const takeAShot = localFont({
  src: "../fonts/TakeAShotPersonalUseRegular-gxMD6.ttf",
  variable: "--font-take-a-shot",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CASEFILE® | Real Clues. True Minds. Your Move.",
  description: "An online detective game where you examine evidence, connect the dots, and solve real-world inspired cases.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("dark", "h-full", "antialiased", takeAShot.variable, bebasNeue.variable, specialElite.variable, inter.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-[#07090c] text-[#e2e8f0] font-sans selection:bg-red-600/30 selection:text-red-200">
        {children}
      </body>
    </html>
  );
}
