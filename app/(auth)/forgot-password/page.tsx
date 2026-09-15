"use client";

import { useState } from "react";

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
    <div className="auth-card">
      <div className="auth-card-head auth-mono">ACCOUNT · RECOVERY</div>
      <h1 className="auth-title auth-display">Reset your password</h1>

      {sent ? (
        <p className="auth-note">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
          Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email" className="auth-label auth-mono">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <button type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="auth-footer-text">
        <a href="/login">Back to sign in</a>
      </p>
    </div>
  );
}
