import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject } from "@/lib/services/project.service";
import { FeatureList } from "@/components/features/feature-list";

export default async function FeaturesPage({ params }: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await getProject(user.id, params.projectId);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold tracking-tight">Features</h2>
      <FeatureList projectId={project.id} initialFeatures={project.features} />
    </div>
  );
}
