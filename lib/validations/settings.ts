import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bio: z.string().max(500).optional(),
});

export const preferencesSchema = z.object({
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  notifyTasks: z.boolean().optional(),
  notifyProject: z.boolean().optional(),
});
