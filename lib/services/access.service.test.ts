import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Prisma singleton before importing the module under test, so
// access.service.ts's `import { prisma } from "@/lib/db/prisma"` gets
// these stubbed functions instead of a real DB connection. This is the
// security-critical module in the app — every mutation everywhere else
// funnels through these three functions — so it's covered in isolation
// rather than only indirectly through whichever route happens to call it.
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    project: { findUnique: vi.fn() },
    projectMember: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { getProjectRole, canViewProject, canEditProject, isProjectOwner } from "./access.service";

const findUniqueProject = prisma.project.findUnique as unknown as ReturnType<typeof vi.fn>;
const findUniqueMember = prisma.projectMember.findUnique as unknown as ReturnType<typeof vi.fn>;

const OWNER_ID = "user_owner";
const EDITOR_ID = "user_editor";
const VIEWER_ID = "user_viewer";
const STRANGER_ID = "user_stranger";
const PROJECT_ID = "project_1";

beforeEach(() => {
  findUniqueProject.mockReset();
  findUniqueMember.mockReset();

  findUniqueProject.mockResolvedValue({ userId: OWNER_ID });
  findUniqueMember.mockImplementation(({ where }: { where: { projectId_userId: { userId: string } } }) => {
    const { userId } = where.projectId_userId;
    if (userId === EDITOR_ID) return Promise.resolve({ role: "EDITOR" });
    if (userId === VIEWER_ID) return Promise.resolve({ role: "VIEWER" });
    return Promise.resolve(null);
  });
});

describe("getProjectRole", () => {
  it("returns OWNER for the project's creator, without checking membership", async () => {
    const role = await getProjectRole(OWNER_ID, PROJECT_ID);
    expect(role).toBe("OWNER");
    expect(findUniqueMember).not.toHaveBeenCalled();
  });

  it("returns EDITOR for a member with that role", async () => {
    expect(await getProjectRole(EDITOR_ID, PROJECT_ID)).toBe("EDITOR");
  });

  it("returns VIEWER for a member with that role", async () => {
    expect(await getProjectRole(VIEWER_ID, PROJECT_ID)).toBe("VIEWER");
  });

  it("returns null for someone with no membership row at all", async () => {
    expect(await getProjectRole(STRANGER_ID, PROJECT_ID)).toBeNull();
  });

  it("returns null when the project doesn't exist, without querying membership", async () => {
    findUniqueProject.mockResolvedValueOnce(null);
    const role = await getProjectRole(STRANGER_ID, "nonexistent");
    expect(role).toBeNull();
    expect(findUniqueMember).not.toHaveBeenCalled();
  });
});

describe("canViewProject", () => {
  it("is true for owner, editor, and viewer", async () => {
    expect(await canViewProject(OWNER_ID, PROJECT_ID)).toBe(true);
    expect(await canViewProject(EDITOR_ID, PROJECT_ID)).toBe(true);
    expect(await canViewProject(VIEWER_ID, PROJECT_ID)).toBe(true);
  });

  it("is false for a stranger", async () => {
    expect(await canViewProject(STRANGER_ID, PROJECT_ID)).toBe(false);
  });
});

describe("canEditProject", () => {
  it("is true for owner and editor", async () => {
    expect(await canEditProject(OWNER_ID, PROJECT_ID)).toBe(true);
    expect(await canEditProject(EDITOR_ID, PROJECT_ID)).toBe(true);
  });

  // The whole point of the VIEWER role — this is the line every write
  // path in the app (features, tasks, notes, MVP, AI generation) relies on.
  it("is false for a viewer", async () => {
    expect(await canEditProject(VIEWER_ID, PROJECT_ID)).toBe(false);
  });

  it("is false for a stranger", async () => {
    expect(await canEditProject(STRANGER_ID, PROJECT_ID)).toBe(false);
  });
});

describe("isProjectOwner", () => {
  it("is true only for the actual owner", async () => {
    expect(await isProjectOwner(OWNER_ID, PROJECT_ID)).toBe(true);
  });

  // Owner-only actions (delete project, invite/remove members) must
  // never be reachable by an editor, no matter how trusted.
  it("is false for an editor, even though editors can edit everything else", async () => {
    expect(await isProjectOwner(EDITOR_ID, PROJECT_ID)).toBe(false);
  });

  it("is false for a viewer", async () => {
    expect(await isProjectOwner(VIEWER_ID, PROJECT_ID)).toBe(false);
  });
});
