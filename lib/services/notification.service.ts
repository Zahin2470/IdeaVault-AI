import { prisma } from "@/lib/db/prisma";

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function countUnread(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

// relatedId + type is the dedup key — creating the same event twice
// (e.g. the due-task cron running two days in a row on an untouched
// task) is a no-op rather than a second notification.
export async function createNotificationOnce(
  userId: string,
  type: string,
  message: string,
  relatedId: string
) {
  const existing = await prisma.notification.findFirst({ where: { type, relatedId } });
  if (existing) return { notification: existing, created: false };

  const notification = await prisma.notification.create({ data: { userId, type, message, relatedId } });
  return { notification, created: true };
}

export async function markRead(userId: string, id: string) {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) return null;

  return prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  return true;
}
