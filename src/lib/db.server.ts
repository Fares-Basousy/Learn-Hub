// Postgres client stub — server only.
//
// Fill in with your preferred driver (`pg`, `postgres`, `drizzle`, etc.).
// Every server route calls `query()` for reads and `withTx()` for
// multi-statement writes so wiring one place is enough.
//
// Example wiring with `pg`:
//
//   import { Pool } from "pg";
//   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
//   export async function query<T>(sql: string, params: unknown[] = []) {
//     const res = await pool.query(sql, params);
//     return res.rows as T[];
//   }

export async function query<T = unknown>(
  _sql: string,
  _params: unknown[] = [],
): Promise<T[]> {
  // TODO: connect to Postgres via DATABASE_URL and return rows.
  throw new Error(
    "db.query is not wired up yet. Configure DATABASE_URL and implement src/lib/db.server.ts.",
  );
}

export async function withTx<T>(
  _fn: (tx: { query: typeof query }) => Promise<T>,
): Promise<T> {
  // TODO: BEGIN / COMMIT / ROLLBACK around the callback.
  throw new Error(
    "db.withTx is not wired up yet. Configure DATABASE_URL and implement src/lib/db.server.ts.",
  );
}
