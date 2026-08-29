import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

// Every server action / route handler that touches user data should call
// this and treat a null result as 401 — this is the real authorization
// boundary (§48), not the middleware redirect below.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
