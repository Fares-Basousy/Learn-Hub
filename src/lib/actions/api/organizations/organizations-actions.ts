"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Organization } from "@/src/lib/types";
import { requireUser } from "@/lib/require-user";

const PAGE_SIZE = 20;

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  picUrl: z.string().trim().url().max(2000),
});
const PatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(200).optional(),
  picUrl: z.string().trim().url().max(2000).optional(),
});

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const RestockSchema = z
  .object({
    grade: z.coerce.number().int().min(1).max(12),
    booksCount: z.coerce.number().int().nonnegative().default(0),
    codesCount: z.coerce.number().int().nonnegative().default(0),
    editionId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
    newEditionName: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(100).optional()),
  })
  .refine((i) => i.booksCount > 0 || i.codesCount > 0, {
    message: "Enter at least one book or code.",
  })
  .refine((i) => i.booksCount === 0 || Boolean(i.editionId || i.newEditionName), {
    message: "Select or enter a book edition.",
  });

export async function createOrganization(formData: FormData) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const data = CreateSchema.parse(entries);
  const { _max } = await prisma.organization.aggregate({ _max: { displayOrder: true } });
  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      subject: data.subject,
      picUrl: data.picUrl,
      displayOrder: (_max.displayOrder ?? -1) + 1,
    },
  });
  return { organization };
}

export async function getOrganizations(pageIndex: number) {
  await requireUser();
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { displayOrder: "asc" },
      skip: pageIndex * PAGE_SIZE,
      take: PAGE_SIZE + 1,
    });
    const hasMore = organizations.length > PAGE_SIZE;
    return { organizations: organizations.slice(0, PAGE_SIZE), hasMore };
  } catch (e) {
    return { organizations: [] as Organization[], hasMore: false, warning: (e as Error).message };
  }
}

// Public, unauthenticated list for the landing page — no inventory/business data included.
// Ordered by the admin-controlled displayOrder, so it matches the organizations page.
export async function getPublicOrganizations() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, subject: true, picUrl: true },
    });
    return { organizations };
  } catch (e) {
    return { organizations: [] as Pick<Organization, "id" | "name" | "subject" | "picUrl">[], warning: (e as Error).message };
  }
}

// Full, unpaginated list — used to populate org dropdowns (students form, sales form, etc).
export async function getOrganizationsAdmin() {
  await requireUser();
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return { organizations };
  } catch (e) {
    return { organizations: [] as Organization[], warning: (e as Error).message };
  }
}

// Swaps displayOrder with the immediate neighbor so the org moves one slot up/down
// in the landing-page listing.
export async function moveOrganizationOrder(id: string, direction: "up" | "down") {
  await requireUser();
  const current = await prisma.organization.findUniqueOrThrow({ where: { id } });
  const neighbor = await prisma.organization.findFirst({
    where:
      direction === "up"
        ? { displayOrder: { lt: current.displayOrder } }
        : { displayOrder: { gt: current.displayOrder } },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return { ok: true };

  await prisma.$transaction([
    prisma.organization.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.organization.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } }),
  ]);
  return { ok: true };
}

export async function getOrganizationById(id: string) {
  await requireUser();
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      inventory: { orderBy: { grade: "asc" } },
      bookInventory: { orderBy: [{ grade: "asc" }], include: { edition: true } },
    },
  });
  return { organization };
}

export async function updateOrganization(id: string, formData: FormData) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const data = PatchSchema.parse(entries);
  const organization = await prisma.organization.update({
    where: { id },
    data: {
      name: data.name,
      subject: data.subject,
      picUrl: data.picUrl,
    },
  });
  return { organization };
}

export async function deleteOrganization(id: string) {
  await requireUser();
  await prisma.organization.delete({ where: { id } });
  return { ok: true };
}

export async function restockInventory(orgId: string, formData: FormData) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const data = RestockSchema.parse(entries);

  await prisma.$transaction(async (tx) => {
    if (data.codesCount > 0) {
      await tx.organizationInventory.upsert({
        where: { orgId_grade: { orgId, grade: data.grade } },
        create: { orgId, grade: data.grade, codesCount: data.codesCount },
        update: { codesCount: { increment: data.codesCount } },
      });
    }

    if (data.booksCount > 0) {
      const edition = data.editionId
        ? { id: data.editionId }
        : await tx.bookEdition.upsert({
            where: { name: data.newEditionName! },
            create: { name: data.newEditionName! },
            update: {},
          });

      await tx.bookInventory.upsert({
        where: { orgId_grade_editionId: { orgId, grade: data.grade, editionId: edition.id } },
        create: { orgId, grade: data.grade, editionId: edition.id, count: data.booksCount },
        update: { count: { increment: data.booksCount } },
      });
    }
  });

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      inventory: { orderBy: { grade: "asc" } },
      bookInventory: { orderBy: [{ grade: "asc" }], include: { edition: true } },
    },
  });
  return { organization };
}
