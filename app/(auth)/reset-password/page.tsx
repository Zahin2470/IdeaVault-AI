"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't reset your password. Please try again.");
      return;
    }

    router.push("/login");
  }

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          This link is missing its reset token. Please request a new one from{" "}
          <a href="/forgot-password" className="text-accent">
            the reset page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <label htmlFor="new-password" className="sr-only">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
        />
        <label htmlFor="confirm-password" className="sr-only">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </div>
  );
}
