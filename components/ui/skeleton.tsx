import { cn } from "@/lib/utils";

// Shared loading placeholder — replaces bare "Loading..." text across
// the app with a shape that hints at the content about to appear.
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
