import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/lib/services/project.service";
import { Badge } from "@/components/ui/badge";

// Project Overview (§18): Problem/Audience/Solution/Value-prop summary,
// current status. Real progress-from-tasks (§37) arrives with Phase 5.
export default async function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProject(user.id, params.projectId);
  if (!project) notFound();

  const sections = [
    { label: "Problem", value: project.problem?.problem },
    { label: "Target Audience", value: project.audience?.primaryAudience },
    { label: "Proposed Solution", value: project.solution?.description },
    { label: "Value Proposition", value: project.solution?.valueProp },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Badge variant="accent">{project.status}</Badge>
        <span className="text-sm text-muted-foreground">
          {project.features.length} feature{project.features.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">{s.label}</h3>
            <p className="mt-1.5 text-sm">
              {s.value || <span className="text-muted-foreground/60">Not defined yet.</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
