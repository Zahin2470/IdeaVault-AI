import { prisma } from "@/lib/db/prisma";
import type { CreateIdeaInput, UpdateIdeaInput } from "@/lib/validations/idea";
import type { IdeaStatus, Prisma } from "@prisma/client";

// Every function here takes userId explicitly and scopes every query by
// it — this is the real authorization boundary (§48). Route handlers
// never touch Prisma directly.

export type IdeaFilter = "all" | "active" | "favorites" | "archived";

export async function listIdeas(
  userId: string,
  opts: { filter?: IdeaFilter; search?: string } = {}
) {
  const { filter = "all", search } = opts;

  const where: Prisma.IdeaWhereInput = { userId };

  if (filter === "active") where.status = { not: "ARCHIVED" };
  if (filter === "archived") where.status = "ARCHIVED";
  if (filter === "favorites") where.favorite = true;

  if (search?.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }

  return prisma.idea.findMany({
    where,
    orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getIdea(userId: string, id: string) {
  return prisma.idea.findFirst({ where: { id, userId } });
}

export async function createIdea(userId: string, data: CreateIdeaInput) {
  return prisma.idea.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags,
    },
  });
}

// Returns null (rather than throwing) when the idea doesn't belong to
// this user, so the route handler can turn that into a clean 404 —
// never leaking whether the id exists for someone else.
export async function updateIdea(userId: string, id: string, data: UpdateIdeaInput) {
  const existing = await prisma.idea.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.idea.update({
    where: { id },
    data: {
      ...data,
      status: data.status as IdeaStatus | undefined,
    },
  });
}

export async function deleteIdea(userId: string, id: string) {
  const existing = await prisma.idea.findFirst({ where: { id, userId } });
  if (!existing) return null;

  await prisma.idea.delete({ where: { id } });
  return true;
}
