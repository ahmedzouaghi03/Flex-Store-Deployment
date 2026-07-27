"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateTeamMember } from "@/actions/teamActions";
import type { TeamMember } from "@/actions/teamActions";

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

export function TeamMemberEditForm({ member, isSelf }: { member: TeamMember; isSelf: boolean }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (password && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError("");

    startTransition(async () => {
      const result = await updateTeamMember(member.id, {
        name: name.trim(),
        email: email.trim(),
        password: password || undefined,
      });
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/team");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--color-border)] bg-white p-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {isSelf && (
        <p className="rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-4 py-2.5 text-xs font-medium text-[var(--color-text)]">
          You're editing your own profile.
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inp} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
          className={inp}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60 active:scale-95"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
        <a
          href="/admin/team"
          className="rounded-xl border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
