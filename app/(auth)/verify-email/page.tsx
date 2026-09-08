"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );

  useEffect(() => {
    if (!token) return;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((res) => setStatus(res.ok ? "success" : "error"));
  }, [token]);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4 text-center">
      {status === "loading" && <p className="text-sm text-muted-foreground">Verifying...</p>}

      {status === "success" && (
        <>
          <h1 className="text-xl font-semibold tracking-tight">Email verified</h1>
          <p className="mt-2 text-sm text-muted-foreground">You&apos;re all set.</p>
          <Button asChild className="mt-4">
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="text-xl font-semibold tracking-tight">Link invalid or expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Request a new verification email from Settings once you&apos;re signed in.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <a href="/login">Sign in</a>
          </Button>
        </>
      )}
    </div>
  );
}
