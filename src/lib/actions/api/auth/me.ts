import { createFileRoute } from "@tanstack/react-router";
import { readSession } from "@/lib/session.server";
import { errorJson, handle, json } from "@/lib/http";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: handle(async () => {
        const s = readSession();
        if (!s) return errorJson("Unauthorized", 401);
        return json({ user: { id: s.userId, username: s.username } });
      }),
    },
  },
});
