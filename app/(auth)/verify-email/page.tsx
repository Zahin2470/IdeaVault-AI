"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
    <div className="auth-card" style={{ textAlign: "center" }}>
      <div className="auth-card-head auth-mono">ACCOUNT · VERIFY</div>

      {status === "loading" && <p className="auth-note">Verifying...</p>}

      {status === "success" && (
        <>
          <h1 className="auth-title auth-display">Email verified</h1>
          <p className="auth-note" style={{ marginBottom: "1.25rem" }}>
            You&apos;re all set.
          </p>
          <a href="/dashboard" className="auth-btn-primary" style={{ display: "block", lineHeight: "42px" }}>
            Go to Dashboard
          </a>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="auth-title auth-display">Link invalid or expired</h1>
          <p className="auth-note" style={{ marginBottom: "1.25rem" }}>
            Request a new verification email from Settings once you&apos;re signed in.
          </p>
          <a href="/login" className="auth-btn-secondary" style={{ display: "block", lineHeight: "40px" }}>
            Sign in
          </a>
        </>
      )}
    </div>
  );
}
