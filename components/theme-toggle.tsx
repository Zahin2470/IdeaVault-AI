"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

// Quick two-state toggle for the pre-auth pages (marketing, auth), which
// have no Settings page to reach the full Light/Dark/System control from.
// Uses the same next-themes provider as the rest of the app (mounted at
// the root layout), so a choice made here carries through into the
// authenticated app after sign-in, and vice versa.
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoids a hydration mismatch: resolvedTheme is undefined on the
  // server and briefly on first client render, so the icon can't be
  // chosen correctly until after mount.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className={className} style={{ width: "20px", height: "20px", display: "inline-block" }} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
