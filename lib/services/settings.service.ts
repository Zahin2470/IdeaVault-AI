import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { profileSchema, preferencesSchema } from "@/lib/validations/settings";

type ProfileInput = z.infer<typeof profileSchema>;
type PreferencesInput = z.infer<typeof preferencesSchema>;

// Preferences row is created lazily — the seed/register flow already
// creates an empty one, but this covers any account that predates that
// or was created another way.
export async function getSettings(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { preferences: true } });
  if (!user) return null;

  const preferences =
    user.preferences ?? (await prisma.userPreference.create({ data: { userId } }));

  return { name: user.name, email: user.email, bio: user.bio, preferences };
}

export async function updateProfile(userId: string, data: ProfileInput) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function updatePreferences(userId: string, data: PreferencesInput) {
  return prisma.userPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
