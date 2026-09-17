"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

// Signs the visitor into the real, seeded demo account using the exact
// same next-auth credentials flow the login form uses — this is a live
// working session in the actual app, not a read-only mockup. Credentials
// come from NEXT_PUBLIC_DEMO_EMAIL/PASSWORD (see lib/services/demo.service.ts),
// intentionally public since the whole point of this account is to be
// shared by anyone who clicks the button.
export function ExploreDemoButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await signIn("credentials", {
      email: process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "alex@example.com",
      password: process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "password123",
      callbackUrl: "/dashboard",
    });
    // No setLoading(false) on success — signIn navigates away. It only
    // matters if the request itself fails before redirecting.
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading demo..." : "Explore Demo — No Signup"}
    </button>
  );
}
