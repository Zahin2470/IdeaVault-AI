import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard.service";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  EXPLORING: "Exploring",
  PLANNED: "Planned",
  BUILDING: "Building",
  COMPLETED: "Completed",
};

// §14 — real dashboard: quick stats, active projects with progress,
// upcoming tasks across every project, and favorite ideas. Server
// component since it's read-heavy and has no interactive filtering,
// unlike the Idea Vault / Task Board pages.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { activeProjects, favoriteIdeas, upcomingTasks, stats } = await getDashboardData(user.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Good to see you, {user.name?.split(" ")[0] ?? "there"}.
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active Ideas" value={stats.totalIdeas} />
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Tasks Due This Week" value={stats.tasksDueThisWeek} />
        <StatCard label="AI Calls Today" value={stats.aiUsageToday} />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Active Projects</h2>
          <Link href="/projects" className="text-sm text-accent">
            View all
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <EmptyRow text="No active projects yet." href="/ideas" cta="Go to Idea Vault" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 hover:border-accent/40"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{p.name}</h3>
                  <Badge variant="accent">{STATUS_LABEL[p.status] ?? p.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.featureCount} feature{p.featureCount === 1 ? "" : "s"} ·{" "}
                  {p.taskCount > 0 ? `${p.tasksDone}/${p.taskCount} tasks done` : "no tasks yet"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Upcoming Tasks</h2>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing due soon.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {upcomingTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/projects/${t.project.id}/tasks`}
                  className="flex items-center justify-between p-3 text-sm hover:bg-muted"
                >
                  <div>
                    <p>{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.project.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {t.dueDate && new Date(t.dueDate).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Favorite Ideas</h2>
          {favoriteIdeas.length === 0 ? (
            <EmptyRow text="No favorites yet." href="/ideas" cta="Go to Idea Vault" />
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {favoriteIdeas.map((idea) => (
                <Link
                  key={idea.id}
                  href="/ideas"
                  className="flex items-center gap-2 p-3 text-sm hover:bg-muted"
                >
                  <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" />
                  <span>{idea.title}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyRow({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
      <span>{text}</span>
      <Link href={href} className="flex items-center gap-1 text-accent">
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
