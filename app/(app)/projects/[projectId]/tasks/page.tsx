import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/lib/services/project.service";
import { listTasks } from "@/lib/services/task.service";
import { listMilestones } from "@/lib/services/milestone.service";
import { TaskBoard } from "@/components/tasks/task-board";

export default async function TasksPage({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProject(user.id, params.projectId);
  if (!project) notFound();

  const [tasks, milestones] = await Promise.all([
    listTasks(user.id, params.projectId),
    listMilestones(user.id, params.projectId),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold tracking-tight">Tasks</h2>
      <TaskBoard
        projectId={project.id}
        initialTasks={tasks ?? []}
        features={project.features}
        milestones={(milestones ?? []).map((m) => ({ id: m.id, title: m.title }))}
      />
    </div>
  );
}
