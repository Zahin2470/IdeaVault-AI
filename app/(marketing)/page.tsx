import { Button } from "@/components/ui/button";

// Placeholder landing page. Full hero/problem/solution/pricing sections
// (§10-11) are a Phase-8 polish item, not part of the Phase-1 foundation.
export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        Turn Random Ideas Into Real Projects.
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Capture ideas, structure your thinking, define your MVP, and turn
        your next big idea into an actionable plan with AI.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <a href="/register">Start Building Free</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/login">Sign in</a>
        </Button>
      </div>
    </div>
  );
}
