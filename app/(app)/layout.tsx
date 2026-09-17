import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { GlobalSearch } from "@/components/search/global-search";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { IdeaNetworkBackground } from "@/components/motion/idea-network-background";
import { Settings } from "lucide-react";

// Base authenticated shell (§9, §58): sidebar + content area on desktop.
// Individual sections (ideas, projects, ai, settings) fill the content slot.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <div className="app-bg-glow" aria-hidden="true" />
      <IdeaNetworkBackground />

      <aside className="surface-premium hidden w-60 shrink-0 border-r border-border md:flex md:flex-col">
        <Link href="/dashboard" className="flex items-center gap-2 px-5 py-6 text-lg font-semibold tracking-tight">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="8.5" className="stroke-accent" strokeWidth="1.4" />
            <path
              d="M11 2.5V5M11 17V19.5M2.5 11H5M17 11H19.5"
              className="stroke-accent"
              strokeWidth="1.4"
            />
            <circle cx="11" cy="11" r="1.6" className="fill-accent-2" />
          </svg>
          IdeaVault
        </Link>
        <div className="px-3 pb-3">
          <GlobalSearch />
        </div>

        <SidebarNav />

        <div className="border-t border-border px-3 py-3 text-sm">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-foreground/80 transition-premium hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Desktop top bar: bell + theme toggle, sidebar already carries nav + search */}
        <header className="hidden h-14 items-center justify-end gap-2 border-b border-border px-6 md:flex">
          <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-premium hover:bg-muted hover:text-foreground" />
          <NotificationBell />
        </header>

        {/* Mobile: compact top bar in place of the sidebar (§8) */}
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 md:hidden">
          <span className="font-semibold">IdeaVault</span>
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-premium hover:bg-muted hover:text-foreground" />
          <NotificationBell />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
