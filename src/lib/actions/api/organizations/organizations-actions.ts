"use server"
import { z } from "zod";
import { query, withTx } from "@/lib/db.server";
//import { requireSession } from "@/lib/session.server";
import { Organization } from "@/src/lib/types";

const PatchSchema = z.object({
  id : z.string(),
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  meta: z.record(z.string(), z.unknown()).optional(),
  books_count: z.number().int().nonnegative().default(0),
  codes_count: z.number().int().nonnegative().default(0),
});
const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  meta: z.record(z.string(), z.unknown()).optional(),
  books_count: z.number().int().nonnegative().default(0),
  codes_count: z.number().int().nonnegative().default(0),
});
const AdjustSchema = z.object({
  id : z.string(),
  books_delta: z.number().int().default(0),
  codes_delta: z.number().int().default(0),
});

export async function createOrganization(formData: FormData) {
   //requiresession();
        const entries = Object.fromEntries(formData.entries());
        const data = CreateSchema.safeParse(entries);
           //requiresession();
        // TODO: INSERT INTO organizations (name, subject, meta, books_count, codes_count)
        //       VALUES ($1,$2,$3,$4,$5) RETURNING *
        const rows : Organization[] = await query(
          "INSERT INTO organizations (name, subject, meta, books_count, codes_count) VALUES ($1,$2,$3,$4,$5) RETURNING *",
          [data.data?.name, data.data?.subject, data.data?.meta ?? {}, data.data?.books_count, data.data?.codes_count],
        );
        return { organization: rows[0] };

}
export async function getOrganizations() {
  try {
          // TODO: SELECT id, name, subject, meta FROM organizations ORDER BY name
          const rows : Organization[] = await query(
            "SELECT id, name, subject, meta FROM organizations ORDER BY name",
          );
          return { organizations: rows };
        } catch (e) {
          // Public endpoint: if DB isn't wired yet, return empty list.
          return { organizations: [], warning: (e as Error).message };
        }
  
}
export async function getOrganizationsAdmin() {
  //requiresession();
          // TODO: SELECT id, name, subject, meta, books_count, codes_count, created_at
          //       FROM organizations ORDER BY created_at DESC
          try {
            const rows : Organization[] = await query(
              `SELECT id, name, subject, meta, books_count, codes_count, created_at FROM organizations ORDER BY created_at DESC`,
            );
            return { organizations: rows };
          } catch (e) {
            // DB not wired yet — return empty list so admin UI can render.
            return { organizations: [], warning: (e as Error).message };
  }
}

export async function UpateOrganization(formData: FormData, id: string ) {
  const entries = Object.fromEntries(formData.entries());
  const data : Organization = PatchSchema.parse(entries);
  //requiresession();
        // TODO: UPDATE organizations SET <dynamic fields> WHERE id = $1 RETURNING *
        const rows : Organization[] = await query("UPDATE organizations SET name = COALESCE($2, name), subject = COALESCE($3, subject), meta = COALESCE($4, meta), books_count = COALESCE($5, books_count), codes_count = COALESCE($6, codes_count) WHERE id = $1 RETURNING *", [
          id,
          data.name ?? null,
          data.subject ?? null,
          data.meta ?? null,
          data.books_count ?? 0,
          data.codes_count ?? null,
        ]);
        return { organization: rows[0] };
 
      }

export async function deleteOrganization(id: string) {
   //requiresession();
        await query("DELETE FROM organizations WHERE id = $1", [id]);
        return { ok: true };
}
export async function adjustInventory(formData : FormData) {
   //requiresession();
   const entries = Object.fromEntries(formData.entries());
    const data = AdjustSchema.safeParse(entries);
        // TODO: atomically update counts, rejecting negative results.
        const rows : Organization[] = await withTx(async (tx) =>
          tx.query(
            "UPDATE organizations SET books_count = books_count + $2, codes_count = codes_count + $3 WHERE id = $1 RETURNING id, books_count, codes_count",
            [data.data?.id, data.data?.books_delta, data.data?.codes_delta],
          ),
        );
        return { organization: rows[0] };
}

        