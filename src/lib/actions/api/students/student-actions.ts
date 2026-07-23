'use server'
import { z } from "zod";
import { query } from "@/lib/db.server";
import { Student } from "@/src/lib/types";
//import { requireSession } from "@/lib/session.server";

const PatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  student_number: z.string().min(1).max(50).optional(),
  grade: z.string().min(1).max(50).optional(),
  school: z.string().min(1).max(200).optional(),
  org_id: z.string().uuid().optional(),
});
const CreateSchema = z.object({
  org_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  student_number: z.string().min(1).max(50),
  grade: z.string().min(1).max(50),
  school: z.string().min(1).max(200),
});

export async function createStudent(formData: FormData) {
   //requiresession();
        const entries = Object.fromEntries(formData.entries());
        const data = CreateSchema.safeParse(entries);
           //requiresession();
        // TODO: INSERT INTO students (org_id, name, student_number, grade, school) VALUES ... RETURNING *
        const rows : Student[] = await query(
          "INSERT INTO students (org_id, name, student_number, grade, school) VALUES ($1,$2,$3,$4,$5) RETURNING *",
          [data.data?.org_id, data.data?.name, data.data?.student_number, data.data?.grade, data.data?.school],
        );
        return { student: rows[0] };

}
export async function getStudents(pageIndex : number) {
   //requiresession();
    // TODO: add pagination SELECT id, org_id, name, student_number, grade, school FROM students ORDER BY name
    const rows : Student[] = await query(`SELECT id, org_id, name, student_number, grade, school FROM students ORDER BY name  OFFSET ${pageIndex* 20} LIMIT 20`,);
  return { students: rows };

}
export async function getStudentById(id : number) {
   //requiresession();
   // TODO: SELECT ... FROM students WHERE id = $1
   const rows : Student[] = await query("SELECT id, org_id, name, student_number, grade, school FROM students WHERE id = $1", [id]);
   return { student: rows[0] ?? null };

}
export async function updateStudent(id: number, formData: FormData) {
   //requiresession();
        const entries = Object.fromEntries(formData.entries());
        const data  = PatchSchema.safeParse(entries);
           //requiresession();
        // TODO: INSERT INTO students (org_id, name, student_number, grade, school) VALUES ... RETURNING *
        // TODO: UPDATE students SET <fields> WHERE id = $1 RETURNING *
        const rows : Student[] = await query(
          "UPDATE students SET name = COALESCE($2, name), student_number = COALESCE($3, student_number), grade = COALESCE($4, grade), school = COALESCE($5, school), org_id = COALESCE($6, org_id) WHERE id = $1 RETURNING *",
          [
            id,
            data.data?.name ?? null,
            data.data?.student_number ?? null,
            data.data?.grade ?? null,
            data.data?.school ?? null,
            data.data?.org_id ?? null,
          ],
        );
        return { student: rows[0] };

}
export async function deleteStudent(id: string) {
  "use server"
   //requiresession();
        await query("DELETE FROM students WHERE id = $1", [id]);
        return { ok: true };
}

