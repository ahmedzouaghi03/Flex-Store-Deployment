"use server";

import { cookies } from "next/headers";

export async function changeLocaleAction(locale: string): Promise<void> {
  const store = await cookies();
  store.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
