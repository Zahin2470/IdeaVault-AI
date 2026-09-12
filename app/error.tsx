"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Root-level error boundary (Next.js App Router convention). Must be a
// client component with this exact signature — Next.js renders this in
// place of the failed segment and gives back a `reset()` to retry
// without a full page reload.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground">
        An unexpected error occurred. You can try again, or head back to the dashboard.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    </div>
  );
}
