"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    // Always show the same success state regardless of whether the email
    // exists — matches the API's anti-enumeration behavior.
    setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>

      {sent ? (
        <p className="mt-4 text-sm text-muted-foreground">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
          Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        <a href="/login" className="text-accent">
          Back to sign in
        </a>
      </p>
    </div>
  );
}
