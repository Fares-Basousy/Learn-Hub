// Small helpers for JSON endpoints.
import { z, ZodError, type ZodTypeAny } from "zod";

export function json<T>(data: T, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

export function errorJson(message: string, status = 400): Response {
  return json({ error: message }, { status });
}

export async function parseJson<S extends ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<z.infer<S>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  try {
    return schema.parse(body) as z.infer<S>;
  } catch (err) {
    if (err instanceof ZodError) {
      throw new Response(
        JSON.stringify({ error: "Validation failed", details: err.issues }),
        { status: 422, headers: { "content-type": "application/json" } },
      );
    }
    throw err;
  }
}

/** Wraps a handler so thrown Response objects become the response. */
export function handle(
  fn: (ctx: { request: Request; params: Record<string, string> }) => Promise<Response>,
) {
  return async (ctx: { request: Request; params: Record<string, string> }) => {
    try {
      return await fn(ctx);
    } catch (e) {
      if (e instanceof Response) return e;
      console.error(e);
      return errorJson("Internal server error", 500);
    }
  };
}
