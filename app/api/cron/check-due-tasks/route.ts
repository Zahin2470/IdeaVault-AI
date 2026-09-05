import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createNotificationOnce } from "@/lib/services/notification.service";

// Scheduled daily via vercel.json (see repo root). Not user-triggered —
// authenticated only by CRON_SECRET, which Vercel Cron sends as a
// Bearer token automatically when the env var is set.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueSoonTasks = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      dueDate: { lte: tomorrow },
      project: { user: { preferences: { notifyTasks: true } } },
    },
    include: { project: { select: { userId: true, name: true } } },
  });

  let created = 0;
  for (const task of dueSoonTasks) {
    const overdue = task.dueDate! < new Date();
    const { created: wasCreated } = await createNotificationOnce(
      task.project.userId,
      "task_due",
      `${overdue ? "Overdue" : "Due soon"}: "${task.title}" in ${task.project.name}.`,
      task.id
    );
    if (wasCreated) created++;
  }

  return NextResponse.json({ checked: dueSoonTasks.length, notified: created });
}
