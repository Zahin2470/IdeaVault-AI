import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { mvpFeaturesSchema } from "@/lib/validations/mvp";
import { setMVPFeatures } from "@/lib/services/mvp.service";

// §24 — replaces the in-scope feature set with the given list.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = mvpFeaturesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const plan = await setMVPFeatures(user.id, params.id, parsed.data.featureIds);
  if (!plan) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ mvpPlan: plan });
}
