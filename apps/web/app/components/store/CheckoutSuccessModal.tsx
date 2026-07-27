"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserPlus, Loader2, X, Eye, EyeOff, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { registerUser, loginUser, checkUserExists } from "@/actions/customerAuthActions";

type Props = {
  orderNumber: string;
  orderId: string;
  prefill: { name: string; email: string; phone: string };
};

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition disabled:bg-[var(--color-bg)] disabled:cursor-not-allowed";

export function CheckoutSuccessModal({ orderNumber, orderId, prefill }: Props) {
  const router = useRouter();
  const t = useTranslations("Modal");
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"check" | "register" | "login">("check");
  const [existingField, setExistingField] = useState<"email" | "phone" | null>(null);

  useEffect(() => {
    if (!prefill.email && !prefill.phone) { setMode("register"); return; }

    startTransition(async () => {
      const result = await checkUserExists(prefill.email, prefill.phone);
      if (result.exists) {
        setExistingField(result.field);
        setMode("login");
      } else {
        setMode("register");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function skip() {
    router.push(`/checkout/success?ref=${orderNumber}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      startTransition(async () => {
        const result = await registerUser({
          name: prefill.name,
          email: prefill.email,
          phoneNumber: prefill.phone,
          password,
          orderId,
        });
        if (!result.success) { setError(result.error ?? "Something went wrong."); return; }
        router.push("/account");
      });
    } else {
      startTransition(async () => {
        const result = await loginUser({ email: prefill.email, password, orderId });
        if (!result.success) { setError(result.error ?? "Invalid password."); return; }
        router.push("/account");
      });
    }
  }

  const isChecking = mode === "check";

  const subtitle = isChecking
    ? t("Checking")
    : mode === "login"
    ? (existingField === "email" ? t("ExistingEmail") : t("ExistingPhone"))
    : t("CreateFree");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="bg-emerald-50 px-6 py-5 text-center relative">
          <button onClick={skip} className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-white/60 transition">
            <X size={16} />
          </button>
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">{t("OrderPlaced")}</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
        </div>

        {isChecking ? (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="animate-spin text-[var(--color-muted)]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--color-text)]">{t("FullName")}</label>
                  <input disabled value={prefill.name} className={inp} readOnly />
                </div>
                {prefill.email && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[var(--color-text)]">{t("Email")}</label>
                    <input disabled value={prefill.email} className={inp} readOnly />
                  </div>
                )}
                {prefill.phone && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[var(--color-text)]">{t("Phone")}</label>
                    <input disabled value={prefill.phone} className={inp} readOnly />
                  </div>
                )}
              </>
            )}

            {mode === "login" && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[var(--color-text)]">{t("Email")}</label>
                <input disabled value={prefill.email} className={inp} readOnly />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[var(--color-text)]">
                {mode === "login" ? t("Password") : t("ChoosePassword")}
                {mode === "register" && (
                  <span className="text-[var(--color-muted)] font-normal text-xs ml-1">{t("PasswordMin")}</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={mode === "register" ? 6 : 1}
                  className={inp + " pr-11"}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
            >
              {isPending
                ? <Loader2 size={16} className="animate-spin" />
                : mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
              {mode === "login" ? t("SignInAndTrack") : t("CreateAndTrack")}
            </button>

            {mode === "login" && (
              <button type="button" onClick={() => { setMode("register"); setError(""); }}
                className="w-full text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
                {t("NotYou")}
              </button>
            )}

            <button type="button" onClick={skip}
              className="w-full text-center text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
              {t("Skip")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
