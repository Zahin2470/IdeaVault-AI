import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

// Single source of truth for the demo account's credentials — read by
// the seed script, the "Explore Demo" button on the landing page, and
// the login rate-limiter's exemption. NEXT_PUBLIC_ prefix is required
// since the landing page button needs these client-side to call
// next-auth's signIn() directly; that's fine here because this account
// is intentionally public, not a real secret.
export function getDemoCredentials() {
  return {
    email: process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "alex@example.com",
    password: process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "password123",
  };
}

export function isDemoEmail(email: string) {
  return email.toLowerCase() === getDemoCredentials().email.toLowerCase();
}

// The demo project mirrors the exact story used in the landing page's
// hero (campus dining problem) — someone who clicks through from the
// marketing page into the live demo sees the same narrative continue,
// rather than an unrelated placeholder.
async function seedDemoContent(userId: string) {
  const idea = await prisma.idea.create({
    data: {
      userId,
      title: "Campus food delivery??",
      description: "ppl always late 4 class bc dining hall lines are insane",
      category: "SaaS",
      tags: ["campus", "food", "students"],
      status: "BUILDING",
      favorite: true,
    },
  });

  const project = await prisma.project.create({
    data: {
      userId,
      ideaId: idea.id,
      name: "Campus Eats",
      status: "BUILDING",
      problem: {
        create: {
          problem: "Students miss meals between back-to-back classes.",
          alternatives: "Waiting in long dining hall lines, or skipping the meal entirely.",
          whyItMatters: "Better nutrition and less stress during a packed class schedule.",
        },
      },
      audience: {
        create: {
          primaryAudience: "Commuter students with tight 15-minute gaps between classes.",
          secondaryAudience: "Graduate students and staff with irregular schedules.",
          painPoints: [
            "Long dining hall lines",
            "No real time between classes",
            "Limited healthy grab-and-go options",
          ],
        },
      },
      solution: {
        create: {
          description: "Pre-order from campus food carts and skip the line entirely.",
          valueProp: "Get real food between classes without spending your gap in a queue.",
          keyBenefits: [
            "Skip the line",
            "Order ahead from your phone",
            "Support local campus vendors",
          ],
          differentiators: [
            "Built specifically for tight class-to-class windows",
            "Direct integration with existing campus carts",
            "No delivery fee — just skip-the-line pickup",
          ],
        },
      },
    },
  });

  const [featurePreorder, , featureNotify] = await Promise.all([
    prisma.feature.create({
      data: {
        projectId: project.id,
        name: "Pre-order & pickup slots",
        priority: "MUST_HAVE",
        status: "BUILDING",
        order: 0,
      },
    }),
    prisma.feature.create({
      data: {
        projectId: project.id,
        name: "Live cart wait times",
        priority: "SHOULD_HAVE",
        status: "PLANNED",
        order: 1,
      },
    }),
    prisma.feature.create({
      data: {
        projectId: project.id,
        name: "Push notification when order's ready",
        priority: "MUST_HAVE",
        status: "PLANNED",
        order: 2,
      },
    }),
  ]);

  await Promise.all([
    prisma.feature.create({
      data: {
        projectId: project.id,
        name: "Loyalty punch card",
        priority: "COULD_HAVE",
        status: "IDEA",
        order: 3,
      },
    }),
    prisma.feature.create({
      data: {
        projectId: project.id,
        name: "Group ordering for study groups",
        priority: "LATER",
        status: "IDEA",
        order: 4,
      },
    }),
  ]);

  const mvpPlan = await prisma.mVPPlan.create({
    data: {
      projectId: project.id,
      goal: "Prove students will pre-order instead of waiting in line.",
      coreUsers: "Commuter students with 15-minute gaps between back-to-back classes.",
      coreProblem: "Missing meals or being late to class because of dining hall lines.",
      successCriteria: [
        "50 pre-orders in the first two weeks",
        "Average pickup wait under 3 minutes",
        "70% of users order a second time",
      ],
    },
  });

  await Promise.all([
    prisma.mVPFeature.create({ data: { mvpPlanId: mvpPlan.id, featureId: featurePreorder.id } }),
    prisma.mVPFeature.create({ data: { mvpPlanId: mvpPlan.id, featureId: featureNotify.id } }),
  ]);

  const twoWeeksOut = new Date();
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
  const sixWeeksOut = new Date();
  sixWeeksOut.setDate(sixWeeksOut.getDate() + 42);

  const [milestoneOnboarded, milestoneMvp] = await Promise.all([
    prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "Cart partner onboarded",
        status: "COMPLETE",
        order: 0,
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "MVP pre-order flow live",
        status: "IN_PROGRESS",
        targetDate: twoWeeksOut,
        order: 1,
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "Campus-wide launch",
        status: "NOT_STARTED",
        targetDate: sixWeeksOut,
        order: 2,
      },
    }),
  ]);

  const threeDaysOut = new Date();
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);

  await Promise.all([
    prisma.task.create({
      data: {
        projectId: project.id,
        milestoneId: milestoneOnboarded.id,
        title: "Sign first cart partner",
        status: "DONE",
        priority: "HIGH",
        completedAt: new Date(),
      },
    }),
    prisma.task.create({
      data: {
        projectId: project.id,
        milestoneId: milestoneMvp.id,
        featureId: featurePreorder.id,
        title: "Build pre-order checkout flow",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: threeDaysOut,
      },
    }),
    prisma.task.create({
      data: {
        projectId: project.id,
        featureId: featurePreorder.id,
        title: "Design pickup slot picker UI",
        status: "TODO",
        priority: "MEDIUM",
      },
    }),
    prisma.task.create({
      data: {
        projectId: project.id,
        featureId: featureNotify.id,
        title: "Write push notification copy",
        status: "BACKLOG",
        priority: "LOW",
      },
    }),
    prisma.task.create({
      data: {
        projectId: project.id,
        title: "Get feedback from 10 students",
        status: "TODO",
        priority: "MEDIUM",
      },
    }),
  ]);

  await Promise.all([
    prisma.note.create({
      data: {
        projectId: project.id,
        content:
          "Talked to Sarah at the Grill Cart — she's excited but wants pickup-volume forecasts before committing more hours.",
        pinned: true,
      },
    }),
    prisma.note.create({
      data: {
        projectId: project.id,
        content: "Ask if we can get a table near the quad for pickup — foot traffic matters.",
      },
    }),
  ]);
}

// Used by both the seed script (local/CI setup) and the periodic reset
// cron (keeps the public demo from accumulating other visitors' edits
// forever) — one definition of "what the demo should look like."
export async function resetDemoData() {
  const { email, password } = getDemoCredentials();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { name: "Alex Morgan", email, passwordHash, preferences: { create: {} } },
  });

  // Projects first (cascades to features/tasks/notes/etc.), then ideas —
  // an Idea with a linked Project can't be deleted first, the FK isn't
  // cascading in that direction.
  await prisma.project.deleteMany({ where: { userId: user.id } });
  await prisma.idea.deleteMany({ where: { userId: user.id } });

  await seedDemoContent(user.id);

  return user;
}
