"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { db } from "@shoestore/db";
import { getCurrentUser } from "@/lib/session";
import type { ActionResult } from "@/types";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (user?.role !== "SUPER_ADMIN") throw new Error("UNAUTHORIZED");
  return user;
}

export async function getTeamMembers(): Promise<ActionResult<TeamMember[]>> {
  try {
    const members = await db.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, isDeleted: false },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });
    return {
      success: true,
      data: members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role as "ADMIN" | "SUPER_ADMIN",
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch {
    return { success: false, error: "Failed to load team" };
  }
}

export async function addTeamMember(data: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
}): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      if (existing.role === "ADMIN" || existing.role === "SUPER_ADMIN") {
        return { success: false, error: "A team member with this email already exists." };
      }
      await db.user.update({
        where: { id: existing.id },
        data: { role: data.role, isDeleted: false },
      });
    } else {
      const hashed = await hash(data.password, 12);
      await db.user.create({
        data: { name: data.name, email: data.email, password: hashed, role: data.role },
      });
    }
    revalidatePath("/admin/team");
    return { success: true };
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") return { success: false, error: "Unauthorized" };
    return { success: false, error: "Failed to add team member" };
  }
}

export async function updateMemberRole(
  memberId: string,
  role: "ADMIN" | "SUPER_ADMIN",
): Promise<ActionResult> {
  try {
    const me = await requireSuperAdmin();
    if (memberId === me.id) return { success: false, error: "Cannot change your own role." };
    await db.user.update({ where: { id: memberId }, data: { role } });
    revalidatePath("/admin/team");
    return { success: true };
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") return { success: false, error: "Unauthorized" };
    return { success: false, error: "Failed to update role" };
  }
}

export async function removeTeamMember(memberId: string): Promise<ActionResult> {
  try {
    const me = await requireSuperAdmin();
    if (memberId === me.id) return { success: false, error: "Cannot remove yourself." };
    const target = await db.user.findUnique({ where: { id: memberId }, select: { role: true } });
    if (target?.role === "SUPER_ADMIN") {
      return { success: false, error: "Demote the member to Admin before removing." };
    }
    await db.user.update({ where: { id: memberId }, data: { role: "NORMAL_USER" } });
    revalidatePath("/admin/team");
    return { success: true };
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") return { success: false, error: "Unauthorized" };
    return { success: false, error: "Failed to remove team member" };
  }
}
