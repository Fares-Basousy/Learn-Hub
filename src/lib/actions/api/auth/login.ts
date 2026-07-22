import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth.server";
import { setSessionCookie } from "@/lib/session.server";
import { errorJson, handle, json, parseJson } from "@/lib/http";

const LoginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: handle(async ({ request }) => {
        const body = await parseJson(request, LoginSchema);
        const user = await verifyPassword(body.username, body.password);
        if (!user) return errorJson("Invalid username or password", 401);
        setSessionCookie({ userId: user.id, username: user.username });
        return json({ user });
      }),
    },
  },
});
