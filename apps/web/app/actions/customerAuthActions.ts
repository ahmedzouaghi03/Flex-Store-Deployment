"use server";

import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSession, setSession, clearSession } from "@/lib/session";
import type { ActionResult } from "@/types";

export async function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<ActionResult<{ name: string; email: string }>> {
  try {
    if (!data.name.trim()) return { success: false, error: "Name is required" };
    if (!data.email.trim()) return { success: false, error: "Email is required" };
    if (data.password.length < 6) return { success: false, error: "Password must be at least 6 characters" };

    const existing = await db.user.findUnique({ where: { email: data.email.trim().toLowerCase() } });
    if (existing) return { success: false, error: "An account with this email already exists" };

    const hashed = await hashPassword(data.password);
    const user = await db.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        password: hashed,
      },
    });

    await setSession({ userId: user.id, email: user.email, name: user.name });
    return { success: true, data: { name: user.name, email: user.email } };
  } catch (error) {
    console.error("[CUSTOMER AUTH] register error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<ActionResult<{ name: string; email: string }>> {
  try {
    if (!data.email.trim() || !data.password) {
      return { success: false, error: "Email and password are required" };
    }

    const user = await db.user.findUnique({ where: { email: data.email.trim().toLowerCase() } });
    if (!user) return { success: false, error: "Invalid email or password" };

    const valid = await verifyPassword(data.password, user.password);
    if (!valid) return { success: false, error: "Invalid email or password" };

    await setSession({ userId: user.id, email: user.email, name: user.name });
    return { success: true, data: { name: user.name, email: user.email } };
  } catch (error) {
    console.error("[CUSTOMER AUTH] login error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
}

export async function logoutUser(): Promise<ActionResult> {
  try {
    await clearSession();
    return { success: true };
  } catch {
    return { success: false, error: "Logout failed" };
  }
}

export async function updateProfile(data: {
  name: string;
  phone?: string;
}): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Not logged in" };
    if (!data.name.trim()) return { success: false, error: "Name is required" };

    const user = await db.user.update({
      where: { id: session.userId },
      data: { name: data.name.trim(), phone: data.phone?.trim() || null },
    });

    await setSession({ userId: user.id, email: user.email, name: user.name });
    revalidatePath("/account");
    revalidatePath("/account/profile");
    return { success: true };
  } catch (error) {
    console.error("[CUSTOMER AUTH] updateProfile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export type PastAddress = { address: string; city: string };

export async function getCheckoutPrefill(): Promise<{
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pastAddresses: PastAddress[];
} | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, phone: true },
  });
  if (!user) return null;

  const addresses = await db.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    select: { address: true, city: true },
  });

  const pastAddresses: PastAddress[] = addresses.map((a) => ({ address: a.address, city: a.city }));

  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    address: pastAddresses[0]?.address ?? "",
    city: pastAddresses[0]?.city ?? "",
    pastAddresses,
  };
}

export async function checkUserExists(email: string, phone?: string): Promise<{ exists: boolean; field: "email" | "phone" | null }> {
  const byEmail = email ? await db.user.findUnique({ where: { email: email.trim().toLowerCase() } }) : null;
  if (byEmail) return { exists: true, field: "email" };
  if (phone?.trim()) {
    const byPhone = await db.user.findFirst({ where: { phone: phone.trim() } });
    if (byPhone) return { exists: true, field: "phone" };
  }
  return { exists: false, field: null };
}
