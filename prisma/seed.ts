import { resetDemoData } from "../lib/services/demo.service";
import { prisma } from "../lib/db/prisma";

// Seeds (or resets) the one demo account, fully populated with a sample
// idea → project so a fresh local setup — or someone clicking "Explore
// Demo" on the landing page for the first time — doesn't land on an
// empty app. The same resetDemoData() function backs the periodic
// public-demo reset cron (app/api/cron/reset-demo/route.ts).
async function main() {
  const user = await resetDemoData();
  console.log(`Seeded demo user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
