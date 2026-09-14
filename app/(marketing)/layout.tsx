import type { ReactNode } from "react";
import { Space_Grotesk, Kalam, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./marketing.css";

// Fonts scoped to this route group only — the authenticated app keeps
// its own type system. Four roles, each doing one job: Space Grotesk
// (structured/technical headline voice), Kalam (genuine handwriting, for
// the "raw idea" scribbles), IBM Plex Sans (body — its engineering/
// technical-drafting association fits the blueprint concept), IBM Plex
// Mono (dimension-line annotations, revision stamps).
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const hand = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-hand",
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});
const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-mkt",
});

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${hand.variable} ${body.variable} ${monoFont.variable} mkt-root`}>
      {children}
    </div>
  );
}
