import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET ?? "dev-secret-please-change-in-production";

export type SessionPayload = { userId: string; email: string; name: string };

function sign(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const data = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = createHmac("sha256", SECRET).update(data).digest("base64url");
    const a = Buffer.from(sig, "base64url");
    const b = Buffer.from(expected, "base64url");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  return verify(token);
}

export async function setSession(payload: SessionPayload): Promise<void> {
  const store = await cookies();
  store.set("session", sign(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete("session");
}
