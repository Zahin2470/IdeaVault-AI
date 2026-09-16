"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Lightbulb, FolderKanban, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ideas", label: "My Ideas", icon: Lightbulb },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/ai", label: "AI Copilot", icon: Sparkles },
];

// Premium touch: the active-item background is a single motion.div with
// a shared layoutId, so instead of just appearing on the new item it
// smoothly slides from wherever it was — the kind of detail that makes a
// sidebar feel considered rather than templated. Falls back to an
// instant position change under prefers-reduced-motion automatically
// (framer-motion respects it for layout animations).
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 text-sm">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md px-3 py-2 transition-premium",
              isActive ? "text-accent-foreground" : "text-foreground/80 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active-pill"
                className="absolute inset-0 rounded-md bg-accent shadow-elevation-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {!isActive && (
              <span className="absolute inset-0 rounded-md transition-premium hover:bg-muted" />
            )}
            {item.href === "/ai" && !isActive && (
              <motion.span
                aria-hidden="true"
                className="absolute left-3 h-4 w-4 rounded-full bg-accent-2/40 blur-[6px]"
                animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4 shrink-0" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
