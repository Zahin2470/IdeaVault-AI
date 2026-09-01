"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Workspace sub-nav (§58) — every section is now live as of Phase 6.
const LIVE_SECTIONS = [
  { href: "", label: "Overview" },
  { href: "/problem", label: "Problem" },
  { href: "/audience", label: "Audience" },
  { href: "/solution", label: "Solution" },
  { href: "/features", label: "Features" },
  { href: "/mvp", label: "MVP" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/tasks", label: "Tasks" },
  { href: "/notes", label: "Notes" },
  { href: "/ai", label: "AI Copilot" },
];

export function ProjectSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <nav className="flex w-44 shrink-0 flex-col gap-1 border-r border-border pr-4 text-sm">
      {LIVE_SECTIONS.map((s) => {
        const href = `${base}${s.href}`;
        const active = pathname === href;
        return (
          <Link
            key={s.label}
            href={href}
            className={cn(
              "rounded-md px-3 py-2 transition-colors",
              active ? "bg-accent text-accent-foreground" : "hover:bg-muted"
            )}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
