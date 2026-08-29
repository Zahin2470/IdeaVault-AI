import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn/ui class-combination helper.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
