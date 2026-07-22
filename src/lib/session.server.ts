// Signed, httpOnly session cookie helpers. Server only.
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";

const COOKIE_NAME = "app_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  userId: string;
  username: string;
  iat: number; // issued-at (seconds)
};

function b64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(s: string): Buffer {
  const pad = 4 - (s.length % 4 || 4);
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad === 4 ? 0 : pad);
  return Buffer.from(b64, "base64");
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(data: string): string {
  return b64urlEncode(createHmac("sha256", secret()).update(data).digest());
}

export function encodeSession(payload: SessionPayload): string {
  const body = b64urlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(b64urlDecode(body).toString("utf8")) as SessionPayload;
    if (!parsed || typeof parsed.userId !== "string") return null;
    // Expire after MAX_AGE
    if (Date.now() / 1000 - parsed.iat > MAX_AGE) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSessionCookie(payload: Omit<SessionPayload, "iat">) {
  const token = encodeSession({ ...payload, iat: Math.floor(Date.now() / 1000) });
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie() {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export function readSession(): SessionPayload | null {
  return decodeSession(getCookie(COOKIE_NAME));
}

/** Throws a 401 Response when there is no valid session. */
export function requireSession(): SessionPayload {
  const s = readSession();
  if (!s) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return s;
}
