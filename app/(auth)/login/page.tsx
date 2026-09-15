"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("We couldn't sign you in. Check your email and password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="auth-card">
      <div className="auth-card-head auth-mono">ACCOUNT · SIGN IN</div>
      <h1 className="auth-title auth-display">Welcome back</h1>

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

        <div className="auth-field">
          <label htmlFor="password" className="auth-label auth-mono">
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>

        <a href="/forgot-password" className="auth-forgot-link">
          Forgot password?
        </a>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading} className="auth-btn-primary">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="auth-btn-secondary"
      >
        Continue with Google
      </button>

      <p className="auth-footer-text">
        No account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
