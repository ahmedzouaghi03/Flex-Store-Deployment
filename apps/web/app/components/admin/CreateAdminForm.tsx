"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { createAdminUser } from "@/actions/authActions";

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

export function CreateAdminForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    startTransition(async () => {
      const res = await createAdminUser({ ...form, role });
      if (!res.success) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setSuccess(
        `${res.data?.email} added as ${role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}.`,
      );
      setForm({ name: "", email: "", phone: "", password: "" });
      setRole("ADMIN");
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
        Add a team member
      </h2>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          value={form.name}
          onChange={set("name")}
          placeholder="Full name"
          className={inp}
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="email@example.com"
          className={inp}
        />
        <input
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder="Phone (optional)"
          className={inp}
        />
        <input
          required
          minLength={6}
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder="Temporary password (min 6 chars)"
          className={inp}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--color-text)]">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
            className={inp}
          >
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
          Create account
        </button>
      </form>
    </section>
  );
}
