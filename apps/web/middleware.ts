import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "authToken";
const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

async function getAdminPayload(token: string): Promise<{ role: string } | null> {
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { role: payload.role as string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // shop.<domain> (or shop.localhost in dev) serves the /shop listing at its root.
  // Generic host check — no env config needed, works the same in prod and locally.
  const hostname = req.headers.get("host")?.split(":")[0] ?? "";
  if (hostname.startsWith("shop.") && pathname === "/") {
    return NextResponse.rewrite(new URL("/shop", req.url));
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const payload = await getAdminPayload(token);

  if (payload && ADMIN_ROLES.has(payload.role)) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
