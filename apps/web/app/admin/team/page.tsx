import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { db } from "@shoestore/db";
import { isSuperAdmin } from "@/lib/auth-guard";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";

export default async function TeamPage() {
  if (!(await isSuperAdmin())) redirect("/admin/products");

  const members = await db.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/10">
          <Users className="h-5 w-5 text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Team</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Manage admins and super admins.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white">
        <h2 className="border-b border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text)]">
          Members ({members.length})
        </h2>
        <ul className="divide-y divide-[var(--color-border)]">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between px-5 py-3.5"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {m.name}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{m.email}</p>
              </div>
              <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                {m.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <CreateAdminForm />
    </div>
  );
}
