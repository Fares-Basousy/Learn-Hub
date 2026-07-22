import { requireSession } from "@/lib/session.server";
import { z } from "zod";
import { query, withTx } from "@/lib/db.server";
import { json, parseJson } from "@/lib/http";

const ItemSchema = z.object({
  type: z.enum(["book", "code", "other"]),
  count: z.number().int().positive(),
});

const CreateSchema = z.object({
  org_id: z.string().uuid(),
  items: z.array(ItemSchema).min(1),
  sold_at: z.string().datetime().optional(),
});


export async function createSale(formData: FormData) {
  'use server'
   requireSession();
        const entries = Object.fromEntries(formData.entries());
        const data = CreateSchema.safeParse(entries);
        requireSession();
        // TODO: run inside a transaction:
        //   1. INSERT INTO sales (org_id, items, sold_at) VALUES ($1,$2,$3) RETURNING *
        //   2. UPDATE organizations SET books_count = books_count - <sum of books>,
        //             codes_count = codes_count - <sum of codes> WHERE id = $1
        const booksDelta = data.data?.items
          .filter((i) => i.type === "book")
          .reduce((a, b) => a + b.count, 0);
        const codesDelta = data.data?.items
          .filter((i) => i.type === "code")
          .reduce((a, b) => a + b.count, 0);

        const sale = await withTx(async (tx) => {
          const inserted = await tx.query(
            "INSERT INTO sales (org_id, items, sold_at) VALUES ($1, $2, COALESCE($3, now())) RETURNING *",
            [data.data?.org_id, JSON.stringify(data.data?.items), data.data?.sold_at ?? null],
          );
          await tx.query(
            "UPDATE organizations SET books_count = books_count - $2, codes_count = codes_count - $3 WHERE id = $1",
            [data.data?.org_id, booksDelta, codesDelta],
          );
          return inserted[0];
        });
        return json({ sale }, { status: 201 });
        

}
export async function getSaleById(id : string) {
  'use server'
   requireSession();
       requireSession();
        // TODO: SELECT * FROM sales WHERE id = $1
        const rows = await query("SELECT id, org_id, items, sold_at FROM sales WHERE id = $1", [
          id,
        ]);
        return json({ sale: rows[0] ?? null });
        

}
export async function getSales(pageIndex : number) {
  'use server'
   requireSession();
        // TODO: SELECT id, org_id, items, sold_at FROM sales ORDER BY sold_at DESC
        const rows = await query(
          `SELECT id, org_id, items, sold_at FROM sales ORDER BY sold_at DESC OFFSET ${pageIndex* 10} LIMIT 10`,
        );
        return json({ sales: rows });
      }
        



 


