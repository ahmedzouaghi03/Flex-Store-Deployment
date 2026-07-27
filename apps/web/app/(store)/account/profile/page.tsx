import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/session";
import { db } from "@shoestore/db";
import { ProfileForm } from "./ProfileForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/account/login");

  const t = await getTranslations("Profile");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, phoneNumber: true, createdAt: true },
  });

  if (!user) redirect("/account/login");

  return (
    <main className="mx-auto max-w-md px-6 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
        >
          <ArrowLeft size={15} />
          {t("BackToOrders")}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("Title")}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {t("MemberSince")}{" "}
          {new Date(user.createdAt).toLocaleDateString("fr-DZ", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <ProfileForm
        initialName={user.name}
        email={user.email}
        initialPhone={user.phoneNumber ?? ""}
      />
    </main>
  );
}
