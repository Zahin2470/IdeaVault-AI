import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";
import { canViewProject, isProjectOwner } from "@/lib/services/access.service";

const INVITE_EXPIRY_DAYS = 7;

// Owner is always project.userId, shown first and not returned as a
// removable ProjectMember row (there isn't one). Only the owner sees
// pending invites — they may contain other people's email addresses.
export async function listMembersAndInvites(userId: string, projectId: string) {
  if (!(await canViewProject(userId, projectId))) return null;

  const [project, members] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!project) return null;

  const owner = await isProjectOwner(userId, projectId);
  const invites = owner
    ? await prisma.projectInvite.findMany({
        where: { projectId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return { owner: project.user, members, invites, isOwner: owner };
}

export async function createInvite(
  inviterUserId: string,
  projectId: string,
  email: string,
  role: "EDITOR" | "VIEWER"
) {
  if (!(await isProjectOwner(inviterUserId, projectId))) return null;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  return prisma.projectInvite.create({
    data: {
      projectId,
      email: email.toLowerCase(),
      role,
      token: randomBytes(24).toString("hex"),
      invitedById: inviterUserId,
      expiresAt,
    },
  });
}

export async function getInviteDetails(token: string) {
  return prisma.projectInvite.findUnique({
    where: { token },
    include: {
      project: { select: { id: true, name: true } },
      invitedBy: { select: { name: true } },
    },
  });
}

export type AcceptInviteResult =
  | { ok: true; projectId: string }
  | { ok: false; error: "not_found" | "expired" | "email_mismatch" };

export async function acceptInvite(
  userId: string,
  userEmail: string,
  token: string
): Promise<AcceptInviteResult> {
  const invite = await prisma.projectInvite.findUnique({ where: { token } });
  if (!invite || invite.status !== "PENDING") return { ok: false, error: "not_found" };

  if (invite.expiresAt < new Date()) {
    await prisma.projectInvite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
    return { ok: false, error: "expired" };
  }

  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    return { ok: false, error: "email_mismatch" };
  }

  await prisma.$transaction([
    prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: invite.projectId, userId } },
      create: { projectId: invite.projectId, userId, role: invite.role },
      update: { role: invite.role },
    }),
    prisma.projectInvite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } }),
  ]);

  return { ok: true, projectId: invite.projectId };
}

export async function removeMember(ownerId: string, projectId: string, memberUserId: string) {
  if (!(await isProjectOwner(ownerId, projectId))) return null;

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: memberUserId } },
  });
  return true;
}
