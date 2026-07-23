// lib/session.ts
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "app_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  userId: string;
  username: string;
  iat: number;
};

function b64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlDecode(s: string): Buffer {
  const pad = 4 - (s.length % 4 || 4);
  const b64 =
    s.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat(pad === 4 ? 0 : pad);

  return Buffer.from(b64, "base64");
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(data: string): string {
  return b64urlEncode(
    createHmac("sha256", secret()).update(data).digest()
  );
}

export function encodeSession(payload: SessionPayload): string {
  const body = b64urlEncode(
    Buffer.from(JSON.stringify(payload), "utf8")
  );

  return `${body}.${sign(body)}`;
}

export function decodeSession(
  token?: string
): SessionPayload | null {
  if (!token) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      b64urlDecode(body).toString("utf8")
    ) as SessionPayload;

    if (typeof parsed.userId !== "string") {
      return null;
    }

    if (Date.now() / 1000 - parsed.iat > MAX_AGE) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  payload: Omit<SessionPayload, "iat">
) {
  const cookieStore = await cookies();

  const token = encodeSession({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  });

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  return decodeSession(cookieStore.get(COOKIE_NAME)?.value);
}

export async function //requiresession(): Promise<SessionPayload> {
  const session = await readSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}