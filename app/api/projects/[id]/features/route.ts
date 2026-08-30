import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createFeatureSchema } from "@/lib/validations/project";
import { listFeatures, createFeature } from "@/lib/services/feature.service";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const features = await listFeatures(user.id, params.id);
  if (features === null) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ features });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createFeatureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const feature = await createFeature(user.id, params.id, parsed.data);
  if (!feature) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ feature }, { status: 201 });
}
