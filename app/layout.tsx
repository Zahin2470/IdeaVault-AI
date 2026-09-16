import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Same display face as marketing/auth, now available app-wide (as
// font-display) — used sparingly (the completion stamp, not every
// heading) so the brand identity carries through without a full
// typography overhaul of the working app.
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "IdeaVault AI",
  description: "Capture ideas. Shape them. Build what matters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={display.variable}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* reducedMotion="user" makes every framer-motion animation in
              the app (sidebar active-pill, list stagger-ins, the
              completion stamp) defer to the OS-level prefers-reduced-motion
              setting automatically — one place to get this right instead
              of checking it in every animated component individually. */}
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
