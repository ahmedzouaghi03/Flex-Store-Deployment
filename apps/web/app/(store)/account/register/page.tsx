"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { registerUser } from "@/actions/customerAuthActions";
import { Suspense } from "react";

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("Register");
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await registerUser({ name, email, phoneNumber: phone, password });
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/account");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--color-border)] bg-white p-6 space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">{t("FullName")}</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inp} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">{t("Email")}</label>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inp} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">{t("Phone")}</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 XX XXX XXX" className={inp} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--color-text)]">
          {t("Password")} <span className="text-[var(--color-muted)] font-normal text-xs">{t("PasswordMin")}</span>
        </label>
        <div className="relative">
          <input
            required
            minLength={6}
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        {t("Submit")}
      </button>
    </form>
  );
}

export default function RegisterPage() {
  const t = useTranslations("Register");
  return (
    <main className="mx-auto max-w-md px-6 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="rounded-full bg-[var(--color-accent)]/10 p-4">
            <UserPlus size={28} className="text-[var(--color-accent)]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("Title")}</h1>
        <p className="text-sm text-[var(--color-muted)]">{t("Subtitle")}</p>
      </div>
      <Suspense>
        <RegisterForm />
      </Suspense>
      <p className="text-center text-sm text-[var(--color-muted)]">
        {t("HaveAccount")}{" "}
        <Link href="/account/login" className="font-semibold text-[var(--color-accent)] hover:underline">{t("SignIn")}</Link>
      </p>
    </main>
  );
}
