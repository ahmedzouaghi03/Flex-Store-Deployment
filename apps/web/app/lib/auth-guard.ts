import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";

function verifyAdminToken(token: string): boolean {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  try {
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

    const { exp } = JSON.parse(
      Buffer.from(payload, "base64").toString("utf8"),
    ) as { exp: number };
    return Date.now() < exp;
  } catch {
    return false;
  }
}

// Boolean check - use in server actions that return ActionResult.
export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value ?? "";
  return verifyAdminToken(token);
}

// Throwing variant - use in route handlers / where you want a hard stop.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
