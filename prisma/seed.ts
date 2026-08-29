import { prisma } from "../lib/db/prisma";
import bcrypt from "bcryptjs";

// Minimal Phase 1 seed: one demo user, enough for auth to be testable.
// Ideas/projects/tasks seed data (§59, §67) lands in a later phase once
// those models are actually exercised by the app.
async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      name: "Alex Morgan",
      email: "alex@example.com",
      passwordHash,
      preferences: { create: {} },
    },
  });

  console.log(`Seeded user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
