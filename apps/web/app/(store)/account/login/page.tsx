"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { loginUser } from "@/actions/customerAuthActions";

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("Login");
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginUser({ email, password });
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/account");
    });
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <LogIn size={28} className="text-[var(--color-text)]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("Title")}</h1>
        <p className="text-sm text-[var(--color-muted)]">{t("Subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--color-border)] bg-white p-6 space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--color-text)]">{t("Email")}</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inp} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[var(--color-text)]">{t("Password")}</label>
          <div className="relative">
            <input
              required
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inp + " pr-11"}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-text)] py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-80 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
          {t("Submit")}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--color-muted)]">
        {t("NoAccount")}{" "}
        <Link href="/account/register" className="font-semibold text-[var(--color-accent)] hover:underline">{t("CreateOne")}</Link>
      </p>
    </main>
  );
}
