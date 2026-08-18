import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// UI / display face. Locked to JetBrains Mono — see DESIGN.md §4.
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
    /* The font variables MUST sit on <html>, not <body>. Tailwind's @theme
       declares --font-display/-pixel/-body on :root, and a custom property's
       var() lookups resolve on the element that declares them — so a font var
       living one level down on <body> is invisible there, which invalidates
       the whole declaration and silently drops every face to the browser
       default. */
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${inter.variable} ${pressStart2P.variable}`}
    >
      <head>
        {/* Applies the stored theme before first paint. Without this the page
            renders light and then snaps to dark, which is worse than no dark
            mode at all. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
