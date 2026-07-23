"use server"
import { z } from "zod";
import { query } from "@/lib/db.server";
import { json,  } from "@/lib/http";
//import { requireSession } from "@/lib/session.server";
import { NewsItem } from "@/src/lib/types"; 

const PatchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  title_ar: z.string().trim().max(200).nullable().optional(),
  body: z.string().trim().max(2000).nullable().optional(),
  body_ar: z.string().trim().max(2000).nullable().optional(),
  image_url: z.string().trim().url().max(2000).nullable().optional(),
  link_url: z.string().trim().url().max(2000).nullable().optional(),
  link_label: z.string().trim().max(120).nullable().optional(),
  link_label_ar: z.string().trim().max(120).nullable().optional(),
  published_at: z.string().datetime().optional(),
});
const NewsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  title_ar: z.string().trim().max(200).optional().nullable(),
  body: z.string().trim().max(2000).optional().nullable(),
  body_ar: z.string().trim().max(2000).optional().nullable(),
  image_url: z.string().trim().url().max(2000).optional().nullable(),
  link_url: z.string().trim().url().max(2000).optional().nullable(),
  link_label: z.string().trim().max(120).optional().nullable(),
  link_label_ar: z.string().trim().max(120).optional().nullable(),
  published_at: z.string().datetime().optional(),
});
export async function createPost(formData: FormData) {
   //requiresession();
        const entries = Object.fromEntries(formData.entries());
        const data = NewsSchema.safeParse(entries);
        const rows = await query(
          "INSERT INTO news (title, title_ar, body, body_ar, image_url, link_url, link_label, link_label_ar, published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9, NOW())) RETURNING *",
          [
            data.data?.title,
            data.data?.title_ar ?? null,
            data.data?.body ?? null,
            data.data?.body_ar ?? null,
            data.data?.image_url ?? null,
            data.data?.link_url ?? null,
            data.data?.link_label ?? null,
            data.data?.link_label_ar ?? null,
            data.data?.published_at ?? null,
          ],
        );
        return json({ item: rows[0] }, { status: 201 });
}
export async function getPosts() {
  try {
          const rows : NewsItem[] = await query(
            "SELECT id, title, title_ar, body, body_ar, image_url, link_url, link_label, link_label_ar, published_at FROM news ORDER BY published_at DESC",
          );
          console.log(rows)
          return { items: rows };
        } catch (e) {
          return { items: [], warning: (e as Error).message };
        }
  
}

export async function UpatePost(formData: FormData, id: string ) {
  const entries = Object.fromEntries(formData.entries());
  const data = PatchSchema.parse(entries);
  //requiresession();
        const rows = await query(
          `UPDATE news SET
             title         = COALESCE($2, title),
             title_ar      = COALESCE($3, title_ar),
             body          = COALESCE($4, body),
             body_ar       = COALESCE($5, body_ar),
             image_url     = COALESCE($6, image_url),
             link_url      = COALESCE($7, link_url),
             link_label    = COALESCE($8, link_label),
             link_label_ar = COALESCE($9, link_label_ar),
             published_at  = COALESCE($10, published_at)
           WHERE id = $1 RETURNING *`,
          [
            id,
            data.title ?? null,
            data.title_ar ?? null,
            data.body ?? null,
            data.body_ar ?? null,
            data.image_url ?? null,
            data.link_url ?? null,
            data.link_label ?? null,
            data.link_label_ar ?? null,
            data.published_at ?? null,
          ],);
        return json({ item: rows[0] });
      }
export async function deletePost(id: string) {
  "use server"
   //requiresession();
        await query("DELETE FROM news WHERE id = $1", [id]);
        return { ok: true };
}
