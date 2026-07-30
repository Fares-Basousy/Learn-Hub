"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Organization } from "@/src/lib/types";
//import { requireSession } from "@/lib/session.server";

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
  //requiresession();
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
  //requiresession();
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
      skip: pageIndex * PAGE_SIZE,
      take: PAGE_SIZE,
    });
    return { organizations };
  } catch (e) {
    return { organizations: [] as Organization[], warning: (e as Error).message };
  }
}

// Full, unpaginated list — used to populate org dropdowns (students form, sales form, etc).
export async function getOrganizationsAdmin() {
  //requiresession();
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
  //requiresession();
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      inventory: { orderBy: { grade: "asc" } },
    },
  });
  return { organization };
}

export async function updateOrganization(id: string, formData: FormData) {
  //requiresession();
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
  //requiresession();
  await prisma.organization.delete({ where: { id } });
  return { ok: true };
}
