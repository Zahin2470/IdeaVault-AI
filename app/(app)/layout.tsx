import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { GlobalSearch } from "@/components/search/global-search";
import { NotificationBell } from "@/components/notifications/notification-bell";

// Base authenticated shell (§9, §58): sidebar + content area on desktop.
// Individual sections (ideas, projects, ai, settings) fill the content slot.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="px-5 py-6 text-lg font-semibold tracking-tight">
          IdeaVault
        </div>
        <div className="px-3 pb-3">
          <GlobalSearch />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 text-sm">
          <a href="/dashboard" className="rounded-md px-3 py-2 hover:bg-muted">
            Dashboard
          </a>
          <a href="/ideas" className="rounded-md px-3 py-2 hover:bg-muted">
            My Ideas
          </a>
          <a href="/projects" className="rounded-md px-3 py-2 hover:bg-muted">
            Projects
          </a>
          <a href="/ai" className="rounded-md px-3 py-2 hover:bg-muted">
            AI Copilot
          </a>
        </nav>
        <div className="border-t border-border px-3 py-3 text-sm">
          <a href="/settings" className="block rounded-md px-3 py-2 hover:bg-muted">
            Settings
          </a>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Desktop top bar: just the bell, sidebar already carries nav + search */}
        <header className="hidden h-14 items-center justify-end border-b border-border px-6 md:flex">
          <NotificationBell />
        </header>

        {/* Mobile: compact top bar in place of the sidebar (§8) */}
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 md:hidden">
          <span className="font-semibold">IdeaVault</span>
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
