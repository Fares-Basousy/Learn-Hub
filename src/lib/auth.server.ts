// Credential verification — server only.
//
// TODO: implement against your Postgres `users` table.
// Example with pg + bcrypt:
//
//   import { compare } from "bcryptjs";
//   import { query } from "./db.server";
//   const rows = await query<{ id: string; username: string; password_hash: string }>(
//     "SELECT id, username, password_hash FROM users WHERE username = $1 LIMIT 1",
//     [username],
//   );
//   if (rows.length === 0) return null;
//   const ok = await compare(password, rows[0].password_hash);
//   return ok ? { id: rows[0].id, username: rows[0].username } : null;

export type AuthUser = { id: string; username: string };

export async function verifyPassword(
  _username: string,
  _password: string,
): Promise<AuthUser | null> {
  // Left empty on purpose — plug in your own check.
  return null;
}
