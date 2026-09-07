import { z } from "zod";

export const MEMBER_ROLES = ["EDITOR", "VIEWER"] as const;

export const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(MEMBER_ROLES).default("VIEWER"),
});
