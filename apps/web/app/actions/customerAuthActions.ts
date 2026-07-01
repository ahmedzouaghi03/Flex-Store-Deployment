"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import { hashPassword, comparePassword } from "@shoestore/utils/hash";
import { getCurrentUser, clearAuthCookie, setAuthCookie } from "@/lib/session";
import type { ActionResult } from "@/types";

async function claimOrder(
  orderId: string | undefined,
  user: { id: string; email: string; phoneNumber: string | null },
) {
  if (!orderId) return;
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { userId: true, customerEmail: true, customerPhone: true, address: true, city: true },
  });
  if (!order || order.userId) return;

  const emailMatches =
    order.customerEmail && order.customerEmail.toLowerCase() === user.email.toLowerCase();
  const phoneMatches =
    order.customerPhone && user.phoneNumber && order.customerPhone === user.phoneNumber;
  if (!emailMatches && !phoneMatches) return;

  await db.order.update({ where: { id: orderId }, data: { userId: user.id } });

  if (order.address && order.city) {
    const existing = await db.address.findFirst({
      where: {
        userId: user.id,
        address: { equals: order.address, mode: "insensitive" },
        city: { equals: order.city, mode: "insensitive" },
      },
    });
    if (!existing) {
      await db.address.create({
        data: {
          userId: user.id,
          address: order.address,
          city: order.city,
          phone: order.customerPhone,
        },
      });
    }
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
  orderId?: string;
}): Promise<ActionResult<{ name: string; email: string }>> {
  try {
    if (!data.name.trim()) return { success: false, error: "Name is required" };
    if (!data.email.trim()) return { success: false, error: "Email is required" };
    if (data.password.length < 6)
      return { success: false, error: "Password must be at least 6 characters" };

    const existing = await db.user.findUnique({
      where: { email: data.email.trim().toLowerCase() },
    });
    if (existing) return { success: false, error: "An account with this email already exists" };

    const hashed = await hashPassword(data.password);
    const user = await db.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber?.trim() || null,
        password: hashed,
      },
    });

    await claimOrder(data.orderId, user);
    await setAuthCookie(user.id, user.role);
    return { success: true, data: { name: user.name, email: user.email } };
  } catch (error) {
    console.error("[CUSTOMER AUTH] register error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

export async function loginUser(data: {
  email: string;
  password: string;
  orderId?: string;
}): Promise<ActionResult<{ name: string; email: string }>> {
  try {
    if (!data.email.trim() || !data.password) {
      return { success: false, error: "Email and password are required" };
    }

    const user = await db.user.findUnique({
      where: { email: data.email.trim().toLowerCase(), isDeleted: false },
    });
    if (!user) return { success: false, error: "Invalid email or password" };

    const valid = await comparePassword(data.password, user.password);
    if (!valid) return { success: false, error: "Invalid email or password" };

    await claimOrder(data.orderId, user);
    await setAuthCookie(user.id, user.role);
    return { success: true, data: { name: user.name, email: user.email } };
  } catch (error) {
    console.error("[CUSTOMER AUTH] login error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
}

export async function logoutUser(): Promise<void> {
  await clearAuthCookie();
  redirect("/");
}

export async function updateProfile(data: {
  name: string;
  phoneNumber?: string;
}): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Not logged in" };
    if (!data.name.trim()) return { success: false, error: "Name is required" };

    await db.user.update({
      where: { id: currentUser.id },
      data: { name: data.name.trim(), phoneNumber: data.phoneNumber?.trim() || null },
    });

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
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    select: { name: true, email: true, phoneNumber: true },
  });
  if (!user) return null;

  const addresses = await db.address.findMany({
    where: { userId: currentUser.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    select: { address: true, city: true },
  });

  const pastAddresses: PastAddress[] = addresses.map((a) => ({
    address: a.address,
    city: a.city,
  }));

  return {
    name: user.name,
    email: user.email,
    phone: user.phoneNumber ?? "",
    address: pastAddresses[0]?.address ?? "",
    city: pastAddresses[0]?.city ?? "",
    pastAddresses,
  };
}

export async function checkUserExists(
  email: string,
  phone?: string,
): Promise<{ exists: boolean; field: "email" | "phone" | null }> {
  const byEmail = email
    ? await db.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    : null;
  if (byEmail) return { exists: true, field: "email" };

  if (phone?.trim()) {
    const byPhone = await db.user.findFirst({
      where: { phoneNumber: phone.trim() },
    });
    if (byPhone) return { exists: true, field: "phone" };
  }

  return { exists: false, field: null };
}
