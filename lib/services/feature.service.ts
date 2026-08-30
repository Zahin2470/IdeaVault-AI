import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { createFeatureSchema, updateFeatureSchema } from "@/lib/validations/project";

type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;

async function assertProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  return !!project;
}

// A feature's owner is reached through its project, so every feature
// mutation re-derives and checks the project's userId — a feature id
// alone never proves ownership (§48).
async function getOwnedFeature(userId: string, featureId: string) {
  const feature = await prisma.feature.findUnique({
    where: { id: featureId },
    include: { project: true },
  });
  if (!feature || feature.project.userId !== userId) return null;
  return feature;
}

export async function listFeatures(userId: string, projectId: string) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;
  return prisma.feature.findMany({ where: { projectId }, orderBy: { order: "asc" } });
}

export async function createFeature(userId: string, projectId: string, data: CreateFeatureInput) {
  if (!(await assertProjectOwnership(userId, projectId))) return null;

  const count = await prisma.feature.count({ where: { projectId } });
  return prisma.feature.create({
    data: { projectId, ...data, order: count },
  });
}

export async function updateFeature(userId: string, featureId: string, data: UpdateFeatureInput) {
  const feature = await getOwnedFeature(userId, featureId);
  if (!feature) return null;

  return prisma.feature.update({ where: { id: featureId }, data });
}

export async function deleteFeature(userId: string, featureId: string) {
  const feature = await getOwnedFeature(userId, featureId);
  if (!feature) return null;

  await prisma.feature.delete({ where: { id: featureId } });
  return true;
}
