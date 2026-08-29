"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Minimal functional login form. Styling/polish per §6/§7 lands in
// Phase 8; Phase 1 just needs a real, working credentials + Google flow.
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
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-10 rounded-md border border-border bg-transparent px-3 text-sm"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <Button
        variant="outline"
        className="mt-3"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        Continue with Google
      </Button>
      <p className="mt-4 text-sm text-muted-foreground">
        No account?{" "}
        <a href="/register" className="text-accent">
          Register
        </a>
      </p>
    </div>
  );
}
