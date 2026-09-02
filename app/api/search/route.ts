import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { searchAll } from "@/lib/services/search.service";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const results = await searchAll(user.id, q);
  return NextResponse.json(results);
}
