"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Calls POST /api/auth/register. After success, sends the user into login.
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "We couldn't create your account. Please try again.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="auth-card">
      <div className="auth-card-head auth-mono">ACCOUNT · NEW</div>
      <h1 className="auth-title auth-display">Create your account</h1>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="name" className="auth-label auth-mono">
            NAME
          </label>
          <input
            id="name"
            type="text"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="auth-input"
          />
        </div>

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

        <div className="auth-field">
          <label htmlFor="password" className="auth-label auth-mono">
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="auth-input"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading} className="auth-btn-primary">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  );
}
