import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { profileSchema } from "@/lib/validations/settings";
import { updateProfile } from "@/lib/services/settings.service";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const updated = await updateProfile(user.id, parsed.data);
  return NextResponse.json({ user: updated });
}
