import type { Metadata } from "next";
import { JetBrains_Mono, Press_Start_2P, VT323 } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";
import { INTRO_INIT_SCRIPT } from "@/components/gallery/introTimeline";
import "./globals.css";

// UI / display face. Locked to JetBrains Mono — see DESIGN.md §4.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Wordmark + h1/h2 only. Single weight; that is all it has.
const pressStart2P = Press_Start_2P({
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  weight: "400",
});

// The hero's terminal face: its sentence and keys.
const terminal = VT323({
  variable: "--font-terminal",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Pixle: open-source pixel icons",
  description:
    "An open-source pixel icon set, drawn cell by cell on an 11 by 11 grid. Copy SVG, React, or PNG. MIT licensed.",
  // The image itself is app/opengraph-image.png; this makes it a large card.
  twitter: { card: "summary_large_image" },
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
      className={`${jetbrainsMono.variable} ${pressStart2P.variable} ${terminal.variable}`}
    >
      <body>
        {/* NO PRE-PAINT THEME SCRIPT (2026-09-13). There was one, and it
            existed to read a stored preference back before first paint —
            without it the page rendered light and snapped to dark, which is
            worse than no dark mode at all. Nothing is stored any more: the
            theme is `prefers-color-scheme` alone, which the stylesheet applies
            at parse time, so there is no frame in which the wrong theme is
            painted and no script needed to prevent one. See lib/theme.ts. */}
        {/* THE BOOT DECIDES BEFORE FIRST PAINT (2026-09-15), which is why a
            pre-paint script is back after the theme one left. The homepage's
            arcade intro hides the hero's pieces only while <html> carries
            `data-intro="play"`, and that attribute has to be there before the
            first frame or the finished hero flashes and then vanishes to be
            typed back in. See introTimeline.ts for when it plays.

            FIRST CHILD OF <body>, for the reason the theme script was: React
            re-creates <head> children rather than hydrating them, and a script
            there is swapped for a <div> on the client. Here the server HTML
            and the React tree agree. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_INIT_SCRIPT }} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
