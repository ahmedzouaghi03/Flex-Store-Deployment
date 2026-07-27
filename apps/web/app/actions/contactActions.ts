"use server";

import { db } from "@shoestore/db";
import { getCurrentUser } from "@/lib/session";
import { sendContactFormEmail } from "@shoestore/utils/email";

export type ContactInput = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export async function submitContact(
  data: ContactInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data.name.trim()) return { success: false, error: "Name is required" };
    if (!data.email.trim()) return { success: false, error: "Email is required" };
    if (!data.message.trim()) return { success: false, error: "Message is required" };

    const user = await getCurrentUser();

    await db.contactSubmission.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
        userId: user?.id ?? null,
      },
    });

    // best-effort — the submission is already saved, so an email hiccup shouldn't fail the request.
    // awaited (not fire-and-forget) so serverless runtimes don't tear down before the send completes.
    await notifySuperAdmins(data).catch((error) => {
      console.error("[CONTACT] failed to notify admins:", error);
    });

    return { success: true };
  } catch (error) {
    console.error("[CONTACT]", error);
    return { success: false, error: "Failed to send message. Please try again." };
  }
}

async function notifySuperAdmins(data: ContactInput) {
  const admins = await db.user.findMany({
    where: { role: "SUPER_ADMIN", isDeleted: false },
    select: { email: true },
  });
  if (admins.length === 0) return;

  await sendContactFormEmail({
    recipient: admins.map((a) => a.email),
    name: data.name.trim(),
    email: data.email.trim(),
    subject: data.subject?.trim(),
    message: data.message.trim(),
  });
}

export async function getContacts(opts?: { unreadOnly?: boolean }) {
  const contacts = await db.contactSubmission.findMany({
    where: opts?.unreadOnly ? { isRead: false } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });
  return contacts.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    subject: c.subject,
    message: c.message,
    isRead: c.isRead,
    createdAt: c.createdAt.toISOString(),
    user: c.user ?? null,
  }));
}

export async function markContactRead(
  id: string,
  isRead: boolean,
): Promise<{ success: boolean }> {
  try {
    await db.contactSubmission.update({ where: { id }, data: { isRead } });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// bulk-clears the "new" indicator — called when the admin opens the Contacts inbox.
// individual messages can still be flagged back to unread afterward via markContactRead.
export async function markAllContactsRead(): Promise<{ success: boolean }> {
  try {
    await db.contactSubmission.updateMany({ where: { isRead: false }, data: { isRead: true } });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteContact(id: string): Promise<{ success: boolean }> {
  try {
    await db.contactSubmission.delete({ where: { id } });
    return { success: true };
  } catch {
    return { success: false };
  }
}
