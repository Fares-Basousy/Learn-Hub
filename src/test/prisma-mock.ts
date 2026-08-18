// Shared Prisma Client mock for unit tests. Import this BEFORE importing the
// server action under test, so the jest.mock() call (hoisted within this file)
// registers before the action module's own `import prisma from "@/lib/prisma"`
// resolves.
import { mockDeep, mockReset, type DeepMockProxy } from "jest-mock-extended";
import type { PrismaClient } from "@/src/generated/prisma/client";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// Server actions call requireUser() first; tests exercise business logic, not
// auth, so always resolve a fake authenticated user.
jest.mock("@/lib/require-user", () => ({
  __esModule: true,
  requireUser: jest.fn().mockResolvedValue({ id: "user-1", name: "Test User", email: "test@example.com" }),
}));

import prisma from "@/lib/prisma";

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
