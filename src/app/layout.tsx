import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

// UI / display face. Stands in for Departure Mono until the files are supplied.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Long-form prose in Guide / Resources.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Wordmark + h1/h2 only. Single weight; that is all it has.
const pressStart2P = Press_Start_2P({
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Pixle — pixel icons + composer",
  description:
    "An open-source pixel, 32-bit, and arcade icon set with an in-browser composer. MIT licensed.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} ${pressStart2P.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
