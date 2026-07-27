import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { db } from "@shoestore/db";

const COOKIE_NAME = "authToken";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
  address?: string | null;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);

    const userId = (payload.id || payload.userId) as string;
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { id: true, name: true, email: true, role: true, phoneNumber: true, address: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address,
    };
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    return null;
  }
}

export async function setAuthCookie(userId: string, role: string): Promise<void> {
  const secret = getSecret();
  const token = await new SignJWT({ id: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Legacy alias used by checkout flow
export async function getSession(): Promise<{ userId: string; email: string; name: string } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { userId: user.id, email: user.email, name: user.name };
}
