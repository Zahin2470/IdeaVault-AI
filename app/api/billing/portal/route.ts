import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createPortalUrl } from "@/lib/services/billing.service";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = await createPortalUrl(user.id);
    if (!url) return NextResponse.json({ error: "No billing account yet — subscribe first." }, { status: 400 });
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't open the billing portal." },
      { status: 502 }
    );
  }
}
