"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, UserRole } from "@shoestore/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSession, setSession, clearSession } from "@/lib/session";
import { requireSuperAdmin } from "@/lib/auth-guard";
import type { ActionResult } from "@/types";

const baseUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ---------- Customer self-registration (always USER) ----------
export async function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<ActionResult<{ name: string; email: string }>> {
  try {
    const parsed = baseUserSchema.safeParse(data);
    if (!parsed.success)
      return { success: false, error: parsed.error.issues[0].message };
    const { name, email, phone, password } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing)
      return {
        success: false,
        error: "An account with this email already exists",
      };
    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: await hashPassword(password),
        role: UserRole.USER,
      },
    });
    await setSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return { success: true, data: { name: user.name, email: user.email } };
  } catch (error) {
    console.error("[AUTH] register error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

// ---------- SUPER_ADMIN creates an ADMIN / SUPER_ADMIN ----------
export async function createAdminUser(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
}): Promise<ActionResult<{ email: string }>> {
  try {
    await requireSuperAdmin();
    const schema = baseUserSchema.extend({
      role: z
        .enum(UserRole)
        .refine((r) => r !== UserRole.USER, "Choose Admin or Super Admin"),
    });
    const parsed = schema.safeParse(data);
    if (!parsed.success)
      return { success: false, error: parsed.error.issues[0].message };
    const { name, email, phone, password, role } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing)
      return {
        success: false,
        error: "An account with this email already exists",
      };
    await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: await hashPassword(password),
        role,
      },
    });
    revalidatePath("/admin/team");
    return { success: true, data: { email } };
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return { success: false, error: "You are not authorized to do this." };
    }
    console.error("[AUTH] createAdminUser error:", error);
    return { success: false, error: "Failed to create admin." };
  }
}

// ---------- Storefront login (any role) ----------
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<ActionResult<{ name: string; email: string; role: UserRole }>> {
  try {
    if (!data.email?.trim() || !data.password) {
      return { success: false, error: "Email and password are required" };
    }
    const user = await db.user.findUnique({
      where: { email: data.email.trim().toLowerCase() },
    });
    if (!user || !(await verifyPassword(data.password, user.password))) {
      return { success: false, error: "Invalid email or password" };
    }
    await setSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return {
      success: true,
      data: { name: user.name, email: user.email, role: user.role },
    };
  } catch (error) {
    console.error("[AUTH] login error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
}

// ---------- Admin login form (useActionState) ----------
export async function adminLogin(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  if (!email || !password) return { error: "Email and password are required." };
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: "Incorrect email or password." };
  }
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    return { error: "This account does not have admin access." };
  }
  await setSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  redirect("/admin/products");
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
    await setSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    revalidatePath("/account");
    revalidatePath("/account/profile");
    return { success: true };
  } catch (error) {
    console.error("[AUTH] updateProfile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
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
    const byPhone = await db.user.findFirst({ where: { phone: phone.trim() } });
    if (byPhone) return { exists: true, field: "phone" };
  }
  return { exists: false, field: null };
}
