"use server"
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { TimetableEntry } from "@/src/lib/types";
import {
  CLASSROOMS,
  MAX_END_MINUTE,
  MIN_DURATION_MINUTES,
  MIN_START_MINUTE,
  formatMinutes,
  rangesOverlap,
} from "@/lib/timetable";

const EntrySchema = z.object({
  classroom: z.enum(CLASSROOMS as [string, ...string[]]),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startMinute: z.coerce.number().int().min(MIN_START_MINUTE).max(MAX_END_MINUTE),
  endMinute: z.coerce.number().int().min(MIN_START_MINUTE).max(MAX_END_MINUTE),
  grade: z.coerce.number().int().min(1).max(12),
  course: z.string().trim().min(1).max(200),
  teacherName: z.string().trim().min(1).max(200),
  teacherSchool: z.string().trim().min(1).max(200),
}).refine((d) => d.endMinute - d.startMinute >= MIN_DURATION_MINUTES, {
  message: `Sessions must be at least ${MIN_DURATION_MINUTES} minutes long`,
});

const PatchSchema = z.object({
  classroom: z.enum(CLASSROOMS as [string, ...string[]]).optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  startMinute: z.coerce.number().int().min(MIN_START_MINUTE).max(MAX_END_MINUTE).optional(),
  endMinute: z.coerce.number().int().min(MIN_START_MINUTE).max(MAX_END_MINUTE).optional(),
  grade: z.coerce.number().int().min(1).max(12).optional(),
  course: z.string().trim().min(1).max(200).optional(),
  teacherName: z.string().trim().min(1).max(200).optional(),
  teacherSchool: z.string().trim().min(1).max(200).optional(),
});

async function assertNoOverlap(
  classroom: string,
  dayOfWeek: number,
  startMinute: number,
  endMinute: number,
  excludeId?: string,
) {
  const existing = await prisma.timetableEntry.findMany({
    where: { classroom, dayOfWeek, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  const conflict = existing.find((e) =>
    rangesOverlap(startMinute, endMinute, e.startMinute, e.endMinute),
  );
  if (conflict) {
    throw new Error(
      `This time overlaps with ${conflict.course} (${formatMinutes(conflict.startMinute)} – ${formatMinutes(conflict.endMinute)}) in ${classroom}`,
    );
  }
}

export async function createTimeTable(formData: FormData) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const data = EntrySchema.parse(entries);
  await assertNoOverlap(data.classroom, data.dayOfWeek, data.startMinute, data.endMinute);
  const entry = await prisma.timetableEntry.create({ data });
  return { entry };
}

export async function updateTimeTable(formData: FormData, id: string) {
  await requireUser();
  const entries = Object.fromEntries(formData.entries());
  const data = PatchSchema.parse(entries);

  const current = await prisma.timetableEntry.findUniqueOrThrow({ where: { id } });
  const classroom = data.classroom ?? current.classroom;
  const dayOfWeek = data.dayOfWeek ?? current.dayOfWeek;
  const startMinute = data.startMinute ?? current.startMinute;
  const endMinute = data.endMinute ?? current.endMinute;
  if (endMinute - startMinute < MIN_DURATION_MINUTES) {
    throw new Error(`Sessions must be at least ${MIN_DURATION_MINUTES} minutes long`);
  }
  await assertNoOverlap(classroom, dayOfWeek, startMinute, endMinute, id);

  const entry = await prisma.timetableEntry.update({
    where: { id },
    data: {
      classroom,
      dayOfWeek,
      startMinute,
      endMinute,
      grade: data.grade ?? current.grade,
      course: data.course ?? current.course,
      teacherName: data.teacherName ?? current.teacherName,
      teacherSchool: data.teacherSchool ?? current.teacherSchool,
    },
  });
  return { entry };
}

export async function deleteTimeTable(id: string) {
  await requireUser();
  await prisma.timetableEntry.delete({ where: { id } });
  return { ok: true };
}

export async function getTimetableEntries() {
  try {
    const entries: TimetableEntry[] = await prisma.timetableEntry.findMany({
      orderBy: [{ classroom: "asc" }, { dayOfWeek: "asc" }, { startMinute: "asc" }],
    });
    return { entries };
  } catch (e) {
    return { entries: [] as TimetableEntry[], warning: (e as Error).message };
  }
}
