import type { ReactNode } from "react";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import { IdeaNetworkBackground } from "@/components/motion/idea-network-background";
import "./auth.css";

// Same blueprint brand as the marketing page (Space Grotesk + IBM Plex),
// minus Kalam — no handwritten scribbles here, this is a functional page.
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});
const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-auth",
});

// Public, unauthenticated shell for login/register/password flows —
// deliberately has no sidebar (§9). Wordmark links back to the landing
// page rather than the dashboard, since a signed-out visitor has nowhere
// else in the app to go yet.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable} ${monoFont.variable} auth-root`}>
      <div className="auth-grid-bg" aria-hidden="true" />
      <IdeaNetworkBackground accentVar="--auth-cyan" accent2Var="--auth-amber" />
      <div className="auth-shell">
        <div className="auth-top-row">
          <Link href="/" className="auth-brand auth-display">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="8.5" stroke="var(--auth-cyan)" strokeWidth="1.4" />
              <path d="M11 2.5V5M11 17V19.5M2.5 11H5M17 11H19.5" stroke="var(--auth-cyan)" strokeWidth="1.4" />
              <circle cx="11" cy="11" r="1.6" fill="var(--auth-amber)" />
            </svg>
            IdeaVault
          </Link>
          <ThemeToggle className="auth-theme-toggle" />
        </div>
        <div className="auth-center">{children}</div>
      </div>
    </div>
  );
}
