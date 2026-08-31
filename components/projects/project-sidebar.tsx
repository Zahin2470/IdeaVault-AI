"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Workspace sub-nav (§58). Sections not yet built (MVP, Roadmap, Tasks,
// Notes, AI) are shown per the spec's fixed nav but disabled, so the
// full journey stays visible without linking to 404s before their phase lands.
const LIVE_SECTIONS = [
  { href: "", label: "Overview" },
  { href: "/problem", label: "Problem" },
  { href: "/audience", label: "Audience" },
  { href: "/solution", label: "Solution" },
  { href: "/features", label: "Features" },
  { href: "/mvp", label: "MVP" },
];

const UPCOMING_SECTIONS = ["Roadmap", "Tasks", "Notes", "AI"];

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
      <div className="mt-2 border-t border-border pt-2">
        {UPCOMING_SECTIONS.map((label) => (
          <div
            key={label}
            className="cursor-not-allowed rounded-md px-3 py-2 text-muted-foreground/50"
            title="Coming in a later phase"
          >
            {label}
          </div>
        ))}
      </div>
    </nav>
  );
}
