import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { createFeatureSchema, updateFeatureSchema } from "@/lib/validations/project";
import { canViewProject, canEditProject } from "@/lib/services/access.service";

type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;

async function getFeatureProjectId(featureId: string) {
  const feature = await prisma.feature.findUnique({ where: { id: featureId }, select: { projectId: true } });
  return feature?.projectId ?? null;
}

export async function listFeatures(userId: string, projectId: string) {
  if (!(await canViewProject(userId, projectId))) return null;
  return prisma.feature.findMany({ where: { projectId }, orderBy: { order: "asc" } });
}

export async function createFeature(userId: string, projectId: string, data: CreateFeatureInput) {
  if (!(await canEditProject(userId, projectId))) return null;

  const count = await prisma.feature.count({ where: { projectId } });
  return prisma.feature.create({ data: { projectId, ...data, order: count } });
}

export async function updateFeature(userId: string, featureId: string, data: UpdateFeatureInput) {
  const projectId = await getFeatureProjectId(featureId);
  if (!projectId || !(await canEditProject(userId, projectId))) return null;

  return prisma.feature.update({ where: { id: featureId }, data });
}

export async function deleteFeature(userId: string, featureId: string) {
  const projectId = await getFeatureProjectId(featureId);
  if (!projectId || !(await canEditProject(userId, projectId))) return null;

  await prisma.feature.delete({ where: { id: featureId } });
  return true;
}
