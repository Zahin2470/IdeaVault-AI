import { prisma } from "@/lib/db/prisma";
import type { MVPPlanInput } from "@/lib/validations/mvp";
import { canEditProject } from "@/lib/services/access.service";

export async function upsertMVPPlan(userId: string, projectId: string, data: MVPPlanInput) {
  if (!(await canEditProject(userId, projectId))) return null;

  return prisma.mVPPlan.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
}

export async function setMVPFeatures(userId: string, projectId: string, featureIds: string[]) {
  if (!(await canEditProject(userId, projectId))) return null;

  const plan = await prisma.mVPPlan.upsert({
    where: { projectId },
    create: { projectId },
    update: {},
  });

  await prisma.$transaction([
    prisma.mVPFeature.deleteMany({
      where: { mvpPlanId: plan.id, featureId: { notIn: featureIds } },
    }),
    ...featureIds.map((featureId) =>
      prisma.mVPFeature.upsert({
        where: { featureId },
        create: { mvpPlanId: plan.id, featureId, inScope: true },
        update: { inScope: true, mvpPlanId: plan.id },
      })
    ),
  ]);

  return prisma.mVPPlan.findUnique({ where: { id: plan.id }, include: { mvpFeatures: true } });
}
