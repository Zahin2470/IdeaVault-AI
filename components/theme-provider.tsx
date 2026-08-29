"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

// Wraps next-themes so the rest of the app can read/set light, dark, or
// system mode without touching localStorage directly (§7).
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>{children}</NextThemesProvider>
  );
}
