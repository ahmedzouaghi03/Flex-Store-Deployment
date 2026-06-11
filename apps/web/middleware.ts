import { NextRequest, NextResponse } from "next/server";

const COOKIE = "admin_session";

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function isValidToken(token: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBytes(sig),
      enc.encode(payload),
    );
    if (!valid) return false;

    const { exp } = JSON.parse(atob(payload)) as { exp: number };
    return Date.now() < exp;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value ?? "";
  if (await isValidToken(token)) return NextResponse.next();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
