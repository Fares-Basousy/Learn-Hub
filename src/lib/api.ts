// Small typed fetch helper for JSON API calls.
export type ApiError = { error: string; details?: unknown };

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const contentType = res.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const message =
      typeof body === "object" && body && "error" in body
        ? String((body as ApiError).error)
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}
