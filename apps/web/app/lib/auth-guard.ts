import "server-only";
import { getSession, type SessionPayload } from "@/lib/session";
import { UserRole } from "@shoestore/db";

const ADMIN_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export async function getAdminSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) return null;
  return session;
}

// Boolean check - use in server actions that return ActionResult.
export async function isAdmin(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === UserRole.SUPER_ADMIN;
}

// Throwing variant - use in route handlers / where you want a hard stop.
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== UserRole.SUPER_ADMIN) throw new Error("Unauthorized");
  return session;
}