import { NextResponse } from "next/server";
import { resetDemoData } from "@/lib/services/demo.service";

// Scheduled via vercel.json, same CRON_SECRET auth pattern as the
// due-task reminder cron (Phase 11). Wipes and re-seeds the shared
// public demo account periodically so it doesn't accumulate every
// visitor's edits indefinitely — a demo that only ever grows messier is
// worse than one that resets.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await resetDemoData();
  return NextResponse.json({ reset: true, email: user.email });
}
