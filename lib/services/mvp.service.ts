import { prisma } from "@/lib/db/prisma";
import type { MVPPlanInput } from "@/lib/validations/mvp";

async function assertProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  return !!project;
}

// §23 — upserts the plan's own fields. Feature scope is handled
// separately by setMVPFeatures so the two forms can save independently.
export async function upsertMVPPlan(userId: string, projectId: string, data: MVPPlanInput) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;

  return prisma.mVPPlan.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });
}

// §24 — replaces the full in-scope feature set in one call. Creates the
// MVPPlan row first if the user hasn't touched the plan fields yet, since
// MVPFeature always needs a parent plan to attach to.
export async function setMVPFeatures(userId: string, projectId: string, featureIds: string[]) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;

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

  return prisma.mVPPlan.findUnique({
    where: { id: plan.id },
    include: { mvpFeatures: true },
  });
}
