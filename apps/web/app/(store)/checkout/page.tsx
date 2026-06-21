"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/cart-context";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/actions/orderActions";
import { getDeliveryFeeCents } from "@/actions/storeConfigActions";
import { CheckoutSuccessModal } from "@/components/store/CheckoutSuccessModal";

export default function CheckoutPage() {
  const { items, totalCents, clearCart } = useCart();
  const router = useRouter();
  const t = useTranslations("Checkout");
  const [, startTransition] = useTransition();
  const [deliveryFeeCents, setDeliveryFeeCents] = useState(0);

  useEffect(() => {
    getDeliveryFeeCents().then(setDeliveryFeeCents);
  }, []);

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity]       = useState("");
  const [error, setError]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{ publicId: string | null } | null>(null);

  useEffect(() => {
    if (items.length === 0 && !modal) router.replace("/cart");
  }, [items.length, modal, router]);

  if (items.length === 0 && !modal) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError(t("ErrorNameRequired")); return; }
    setSubmitting(true);
    setError("");

    startTransition(async () => {
      try {
        const result = await createOrder(
          { name, email, phone, address, city },
          items,
        );
        if (!result.success) {
          setError(result.error ?? t("ErrorGeneral"));
          setSubmitting(false);
          return;
        }
        clearCart();
        setModal({ publicId: result.data!.publicId ?? null });
      } catch {
        setError(t("ErrorGeneral"));
        setSubmitting(false);
      }
    });
  }

  return (
    <>
    {modal && (
      <CheckoutSuccessModal
        publicId={modal.publicId}
        prefill={{ name, email, phone }}
      />
    )}
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("Title")}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Customer form */}
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 space-y-4">
            <h2 className="font-bold text-[var(--color-text)]">{t("YourInfo")}</h2>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Field label={t("FullName")}>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={inp}
              />
            </Field>

            <Field label={t("Email")}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inp}
              />
            </Field>

            <Field label={t("Phone")}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 6XX XX XX XX"
                className={inp}
              />
            </Field>

            <Field label={t("Address")}>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                className={inp}
              />
            </Field>

            <Field label={t("City")}>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Algiers"
                className={inp}
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60 active:scale-95"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("PlaceOrder")}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-white p-6 space-y-4">
            <h2 className="font-bold text-[var(--color-text)]">{t("OrderSummary")}</h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-12 w-10 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-10 flex-shrink-0 rounded-lg bg-[var(--color-border)]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-text)]">{item.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {[item.size && `${t("Size")} ${item.size}`, item.colorName].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {formatPrice(item.priceCents * item.quantity)}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-[var(--color-border)] pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">{t("Subtotal")}</span>
                <span className="font-semibold text-[var(--color-text)]">{formatPrice(totalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">{t("Shipping")}</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {deliveryFeeCents === 0 ? t("Free") : formatPrice(deliveryFeeCents)}
                </span>
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-3 flex justify-between">
              <span className="font-bold text-[var(--color-text)]">{t("Total")}</span>
              <span className="font-bold text-[var(--color-text)]">{formatPrice(totalCents + deliveryFeeCents)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-[var(--color-text)]">{label}</label>
      {children}
    </div>
  );
}

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";
