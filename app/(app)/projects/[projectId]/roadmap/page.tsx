import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/lib/services/project.service";
import { listMilestones } from "@/lib/services/milestone.service";
import { MilestoneList } from "@/components/roadmap/milestone-list";

export default async function RoadmapPage({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProject(user.id, params.projectId);
  if (!project) notFound();

  const milestones = (await listMilestones(user.id, params.projectId)) ?? [];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold tracking-tight">Roadmap</h2>
      <MilestoneList
        projectId={project.id}
        initialMilestones={milestones.map((m) => ({
          ...m,
          targetDate: m.targetDate ? m.targetDate.toISOString() : null,
        }))}
      />
    </div>
  );
}
