import Link from "next/link";
import { Button } from "@/components/ui/button";

// Root-level 404 (Next.js App Router convention) — catches any route
// that doesn't match, inside or outside the authenticated shell.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">This page doesn&apos;t exist.</p>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
