import { NextRequest, NextResponse } from "next/server";

function b64urlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function readSessionRole(token: string): Promise<string | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const signature = b64urlToBytes(sig);

    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      signature.slice().buffer,
      new TextEncoder().encode(data),
    );

    if (!ok) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(b64urlToBytes(data)),
    ) as {
      role?: string;
    };

    return payload.role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("session")?.value ?? "";
  const role = await readSessionRole(token);
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  if (!isAdmin) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Team management is SUPER_ADMIN only
  if (pathname.startsWith("/admin/team") && role !== "SUPER_ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/products";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
