import { getCurrentUser } from "@/lib/auth/session";

// Placeholder for Phase 7 (§14) — Phase 1 only needs the authenticated
// route + layout to exist and render for a signed-in user.
export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Good to see you, {user?.name?.split(" ")[0] ?? "there"}.
      </h1>
      <p className="mt-2 text-muted-foreground">
        Dashboard content (active projects, next tasks, AI insight) lands in
        Phase 7.
      </p>
    </div>
  );
}
