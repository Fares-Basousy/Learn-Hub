'use server'
import { z } from "zod";
import { query } from "@/lib/db.server";
import { handle, json, parseJson } from "@/lib/http";
import { TimetableEntry } from "@/src/lib/types";
//import { requireSession } from "@/lib/session.server";

const PatchSchema = z.object({
  classroom: z.string().min(1).max(50).optional(),
  day_of_week: z.number().int().min(0).max(6).optional(),
  session_index: z.number().int().min(0).max(20).optional(),
  grade: z.string().min(1).max(50).optional(),
  course: z.string().min(1).max(200).optional(),
  teacher_name: z.string().min(1).max(200).optional(),
  teacher_school: z.string().min(1).max(200).optional(),
});
const EntrySchema = z.object({
  classroom: z.string().min(1).max(50),
  day_of_week: z.number().int().min(0).max(6),
  session_index: z.number().int().min(0).max(20),
  grade: z.string().min(1).max(50),
  course: z.string().min(1).max(200),
  teacher_name: z.string().min(1).max(200),
  teacher_school: z.string().min(1).max(200),
});
export async function createTimeTable(formData: FormData) {
  
  //requiresession();
  const entries = Object.fromEntries(formData.entries());
  const data = EntrySchema.safeParse(entries);
  // TODO: INSERT INTO timetable_entries (...) VALUES (...) RETURNING *
  const rows : TimetableEntry[] = await query(
    "INSERT INTO timetable_entries (classroom, day_of_week, session_index, grade, course, teacher_name, teacher_school) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
    [
      data.data?.classroom,
      data.data?.day_of_week,
      data.data?.session_index,
      data.data?.grade,
      data.data?.course,
      data.data?.teacher_name,
      data.data?.teacher_school,
    ],
  );
  return { entry: rows[0] };
      }
export async function updateTimeTable(formData: FormData, id : number) {
  
   //requiresession();
   const entries = Object.fromEntries(formData.entries());
   const data = PatchSchema.safeParse(entries);
        // TODO: UPDATE timetable_entries SET <fields> WHERE id = $1 RETURNING *
        const rows : TimetableEntry[] = await query(
          "UPDATE timetable_entries SET classroom = COALESCE($2, classroom), day_of_week = COALESCE($3, day_of_week), session_index = COALESCE($4, session_index), grade = COALESCE($5, grade), course = COALESCE($6, course), teacher_name = COALESCE($7, teacher_name), teacher_school = COALESCE($8, teacher_school) WHERE id = $1 RETURNING *",
          [
            id,
            data.data?.classroom ?? null,
            data.data?.day_of_week ?? null,
            data.data?.session_index ?? null,
            data.data?.grade ?? null,
            data.data?.course ?? null,
            data.data?.teacher_name ?? null,
            data.data?.teacher_school ?? null,
          ],
        );
        return { entry: rows[0] };
      }

export async function deleteTimeTable(id : number) {
  
   //requiresession();
   //requiresession();
        // TODO: DELETE FROM timetable_entries WHERE id = $1
        await query("DELETE FROM timetable_entries WHERE id = $1", [id]);
        return { ok: true };
      }
export async function getTimetableEntries() {
  
   //requiresession();
  try {
          // TODO: SELECT * FROM timetable_entries ORDER BY classroom, day_of_week, session_index
          const rows : TimetableEntry[] = await query(
            "SELECT id, classroom, day_of_week, session_index, grade, course, teacher_name, teacher_school FROM timetable_entries ORDER BY classroom, day_of_week, session_index",
          );
          return { entries: rows };
        } catch (e) {
          // Empty when DB isn't wired yet — landing page still renders.
          return { entries: [], warning: (e as Error).message };
        }
      }
  