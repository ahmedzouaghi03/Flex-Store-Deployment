"use server";

import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";
const SESSION_HOURS = 24;

function createToken(): string {
  const secret = process.env.AUTH_SECRET!;
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000 }),
  ).toString("base64");
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export async function login(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass) {
    return { error: "Admin credentials are not configured." };
  }

  if (username !== validUser || password !== validPass) {
    return { error: "Incorrect username or password." };
  }

  const jar = await cookies();
  jar.set(COOKIE, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_HOURS * 60 * 60,
    path: "/",
  });

  redirect("/admin/products");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/admin/login");
}
