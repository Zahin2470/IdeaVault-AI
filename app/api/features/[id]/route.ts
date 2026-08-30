import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateFeatureSchema } from "@/lib/validations/project";
import { updateFeature, deleteFeature } from "@/lib/services/feature.service";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateFeatureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const feature = await updateFeature(user.id, params.id, parsed.data);
  if (!feature) return NextResponse.json({ error: "Feature not found" }, { status: 404 });

  return NextResponse.json({ feature });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await deleteFeature(user.id, params.id);
  if (!ok) return NextResponse.json({ error: "Feature not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
