import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Premium refresh (pass 2): the default variant was a flat single-color
// fill — reads as "styled" rather than "designed." A subtle top-lighter
// gradient (not a loud rainbow one) is what most premium button systems
// actually do; combined with the glow on outline/destructive hover, this
// is the detail set that was missing, not more motion.
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-premium active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(180deg,hsl(var(--accent)/1),hsl(var(--accent)/0.88))] text-accent-foreground shadow-elevation-sm hover:shadow-elevation-md hover:brightness-110",
        outline:
          "border border-border bg-transparent hover:border-accent/45 hover:bg-muted hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.1)]",
        ghost: "hover:bg-muted",
        destructive:
          "bg-[linear-gradient(180deg,hsl(var(--danger)/1),hsl(var(--danger)/0.88))] text-white shadow-elevation-sm hover:shadow-elevation-md hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
