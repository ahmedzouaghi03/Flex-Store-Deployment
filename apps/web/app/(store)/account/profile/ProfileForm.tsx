"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/actions/customerAuthActions";

type Props = { initialName: string; email: string; initialPhone: string };

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition disabled:bg-[var(--color-bg)] disabled:text-[var(--color-muted)] disabled:cursor-default";

export function ProfileForm({ initialName, email, initialPhone }: Props) {
  const t = useTranslations("Profile");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await updateProfile({ name, phoneNumber: phone });
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  function handleCancel() {
    setName(initialName);
    setPhone(initialPhone);
    setEditing(false);
    setError("");
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-[var(--color-border)] bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--color-text)]">{t("PersonalDetails")}</h2>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
          >
            <Pencil size={12} /> {t("Edit")}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {t("Save")}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
            >
              <X size={12} /> {t("Cancel")}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t("Updated")}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">{t("FullName")}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!editing}
          required
          className={inp}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">{t("Email")}</label>
        <input value={email} disabled className={inp} />
        <p className="text-xs text-[var(--color-muted)]">{t("EmailLocked")}</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">{t("Phone")}</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={!editing}
          placeholder="+216 XX XXX XXX"
          className={inp}
        />
      </div>
    </form>
  );
}
