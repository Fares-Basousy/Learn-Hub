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

export async function createOrganization(formData: FormData) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const data = CreateSchema.parse(entries);
  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      subject: data.subject,
      picUrl: data.picUrl,
    },
  });
  return { organization };
}

export async function getOrganizations(pageIndex: number) {
  await requireUser();
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
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
export async function getPublicOrganizations() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
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
      orderBy: { name: "asc" },
    });
    return { organizations };
  } catch (e) {
    return { organizations: [] as Organization[], warning: (e as Error).message };
  }
}

export async function getOrganizationById(id: string) {
  await requireUser();
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      inventory: { orderBy: { grade: "asc" } },
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
