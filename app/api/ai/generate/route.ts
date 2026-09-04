import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { generateRequestSchema } from "@/lib/validations/ai-generate";
import { generateProposal } from "@/lib/services/ai-generate.service";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const result = await generateProposal(user.id, parsed.data.projectId, parsed.data.operation);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ proposal: result.proposal });
}
