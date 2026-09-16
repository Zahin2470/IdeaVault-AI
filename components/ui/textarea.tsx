import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground transition-premium focus-visible:outline-none focus-visible:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent/20 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
