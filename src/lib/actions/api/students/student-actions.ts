"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Gender } from "@/src/generated/prisma/enums";
import { Organization, Student } from "@/src/lib/types";
import { requireUser } from "@/lib/require-user";

const PAGE_SIZE = 20;
const MIN_GRADE_COUNT = 10;

// A student may belong to zero or more orgs — orgIds comes in as multiple
// "orgIds" entries on the FormData, collected separately via formData.getAll.
const orgIdsField = z.array(z.string().uuid());

const CreateSchema = z.object({
  orgIds: orgIdsField,
  name: z.string().min(1).max(200),
  number: z.string().min(1).max(50),
  grade: z.coerce.number().int().min(1).max(12),
  school: z.string().min(1).max(200),
  type: z.string().max(100).optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]),
});
const PatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  number: z.string().min(1).max(50).optional(),
  grade: z.coerce.number().int().min(1).max(12).optional(),
  school: z.string().min(1).max(200).optional(),
  type: z.string().max(100).optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  orgIds: orgIdsField.optional(),
});

export type StudentFilters = {
  orgId?: string;
  grade?: number;
};

const withOrganizations = { organizations: { include: { org: true } } } as const;

// Prisma returns membership join rows; flatten to the plain orgs the UI expects.
function flattenStudent(student: {
  id: string;
  name: string;
  number: string;
  grade: number;
  school: string;
  type: string | null;
  gender: Gender;
  organizations: { org: Organization }[];
}): Student {
  return { ...student, organizations: student.organizations.map((m) => m.org) };
}

export async function createStudent(formData: FormData) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const data = CreateSchema.parse({ ...entries, orgIds: formData.getAll("orgIds") });
  const student = await prisma.student.create({
    data: {
      name: data.name,
      number: data.number,
      grade: data.grade,
      school: data.school,
      type: data.type || null,
      gender: data.gender as Gender,
      organizations: { create: data.orgIds.map((orgId) => ({ orgId })) },
    },
    include: withOrganizations,
  });
  return { student: flattenStudent(student) };
}

export async function getStudents(pageIndex: number, filters: StudentFilters = {}) {
  await requireUser();
  try {
    const students = await prisma.student.findMany({
      where: {
        ...(filters.orgId ? { organizations: { some: { orgId: filters.orgId } } } : {}),
        ...(filters.grade !== undefined ? { grade: filters.grade } : {}),
      },
      include: withOrganizations,
      orderBy: { name: "asc" },
      skip: pageIndex * PAGE_SIZE,
      take: PAGE_SIZE + 1,
    });
    const hasMore = students.length > PAGE_SIZE;
    return { students: students.slice(0, PAGE_SIZE).map(flattenStudent), hasMore };
  } catch (e) {
    return { students: [] as Student[], hasMore: false, warning: (e as Error).message };
  }
}

export async function getStudentById(id: string) {
  await requireUser();
  const student = await prisma.student.findUnique({ where: { id }, include: withOrganizations });
  return { student: student ? flattenStudent(student) : null };
}

export async function updateStudent(id: string, formData: FormData) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const orgIdsTouched = formData.has("orgIdsTouched");
  const orgIds = formData.getAll("orgIds");
  const data = PatchSchema.parse({ ...entries, ...(orgIdsTouched ? { orgIds } : {}) });
  const student = await prisma.student.update({
    where: { id },
    data: {
      name: data.name,
      number: data.number,
      grade: data.grade,
      school: data.school,
      ...(data.type !== undefined ? { type: data.type || null } : {}),
      gender: data.gender as Gender | undefined,
      ...(data.orgIds !== undefined
        ? { organizations: { deleteMany: {}, create: data.orgIds.map((orgId) => ({ orgId })) } }
        : {}),
    },
    include: withOrganizations,
  });
  return { student: flattenStudent(student) };
}

export async function deleteStudent(id: string) {
  await requireUser();
  await prisma.student.delete({ where: { id } });
  return { ok: true };
}

// Grades with more than MIN_GRADE_COUNT enrolled students, for the dashboard.
export async function getGradeCounts() {
  await requireUser();
  try {
    const grouped = await prisma.student.groupBy({
      by: ["grade"],
      _count: { _all: true },
      orderBy: { grade: "asc" },
    });
    const grades = grouped
      .filter((g) => g._count._all > MIN_GRADE_COUNT)
      .map((g) => ({ grade: g.grade, count: g._count._all }));
    return { grades };
  } catch (e) {
    return { grades: [] as { grade: number; count: number }[], warning: (e as Error).message };
  }
}
