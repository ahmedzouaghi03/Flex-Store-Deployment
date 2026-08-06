import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "authToken";
const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);
const SHOP_PATH_PREFIXES = ["/shop", "/product", "/cart", "/checkout"];

// Builds the equivalent URL on the shop.<domain> subdomain, preserving path/query.
function shopUrl(req: NextRequest): URL {
  const host = req.headers.get("host") ?? "";
  const [hostname, port] = host.split(":");
  const bareHost = hostname.replace(/^(shop|www)\./, "");
  const newHost = `shop.${bareHost}${port ? `:${port}` : ""}`;
  return new URL(`${req.nextUrl.pathname}${req.nextUrl.search}`, `${req.nextUrl.protocol}//${newHost}`);
}

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
  const onShop = hostname.startsWith("shop.");
  if (onShop && pathname === "/") {
    return NextResponse.rewrite(new URL("/shop", req.url));
  }

  // Product browsing, cart, and checkout only live on the shop subdomain — keeps
  // cart (localStorage) and the auth cookie scoped to a single origin.
  if (!onShop && SHOP_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(shopUrl(req));
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
  matcher: [
    "/",
    "/admin/:path*",
    "/shop/:path*",
    "/product/:path*",
    "/cart/:path*",
    "/checkout/:path*",
  ],
};
