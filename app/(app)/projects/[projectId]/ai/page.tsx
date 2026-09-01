import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/lib/services/project.service";
import { ChatPanel } from "@/components/ai/chat-panel";

export default async function ProjectAIPage({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProject(user.id, params.projectId);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">AI Copilot</h2>
      <ChatPanel
        projectId={project.id}
        emptyStateText={`Ask anything about "${project.name}" — the problem, audience, features, or what to build next.`}
      />
    </div>
  );
}
