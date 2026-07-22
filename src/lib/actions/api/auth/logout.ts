import { createFileRoute } from "@tanstack/react-router";
import { clearSessionCookie } from "@/lib/session.server";
import { handle, json } from "@/lib/http";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: handle(async () => {
        clearSessionCookie();
        return json({ ok: true });
      }),
    },
  },
});
