"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
      <div className="auth-card">
        <div className="auth-card-head auth-mono">ACCOUNT · RECOVERY</div>
        <p className="auth-note">
          This link is missing its reset token. Please request a new one from{" "}
          <a href="/forgot-password" style={{ color: "var(--auth-cyan)" }}>
            the reset page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-card-head auth-mono">ACCOUNT · RECOVERY</div>
      <h1 className="auth-title auth-display">Set a new password</h1>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="new-password" className="auth-label auth-mono">
            NEW PASSWORD
          </label>
          <input
            id="new-password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="confirm-password" className="auth-label auth-mono">
            CONFIRM PASSWORD
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Type it again"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            className="auth-input"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading} className="auth-btn-primary">
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}
