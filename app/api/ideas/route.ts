import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createIdeaSchema } from "@/lib/validations/idea";
import { createIdea, listIdeas, type IdeaFilter } from "@/lib/services/idea.service";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter = (searchParams.get("filter") as IdeaFilter) ?? "all";
  const search = searchParams.get("search") ?? undefined;

  const ideas = await listIdeas(user.id, { filter, search });
  return NextResponse.json({ ideas });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createIdeaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const idea = await createIdea(user.id, parsed.data);
  return NextResponse.json({ idea }, { status: 201 });
}
