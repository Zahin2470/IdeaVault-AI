import type { ReactNode } from "react";

// Public, unauthenticated shell for login/register/password flows —
// deliberately has no sidebar (§9).
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
