"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/cart-context";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/actions/orderActions";
import { getDeliveryFee } from "@/actions/storeSettingsActions";
import type { PastAddress } from "@/actions/customerAuthActions";
import { TUNISIA_CITIES } from "@/lib/tunisia-cities";
import { CheckoutSuccessModal } from "@/components/store/CheckoutSuccessModal";

type Prefill = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pastAddresses: PastAddress[];
} | null;

export function CheckoutForm({ prefill }: { prefill: Prefill }) {
  const { items, total, clearCart, isHydrated } = useCart();
  const router = useRouter();
  const t = useTranslations("Checkout");
  const [, startTransition] = useTransition();
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    getDeliveryFee().then(setDeliveryFee);
  }, []);

  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [address, setAddress] = useState(prefill?.address ?? "");
  const [city, setCity] = useState(prefill?.city ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{ orderNumber: string; orderId: string } | null>(null);
  const orderPlacedRef = useRef(false);

  const pastAddresses = prefill?.pastAddresses ?? [];
  const [selectedAddressKey, setSelectedAddressKey] = useState(
    pastAddresses[0] ? `${pastAddresses[0].address}|${pastAddresses[0].city}` : null,
  );

  const [autoFilled, setAutoFilled] = useState({
    name: !!prefill?.name,
    email: !!prefill?.email,
    phone: !!prefill?.phone,
    address: !!prefill?.address,
    city: !!prefill?.city,
  });

  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);

  function applyPastAddress(p: PastAddress) {
    setAddress(p.address);
    setCity(p.city);
    setSelectedAddressKey(`${p.address}|${p.city}`);
    setAutoFilled((v) => ({ ...v, address: true, city: true }));
    setAddressDropdownOpen(false);
  }

  useEffect(() => {
    if (isHydrated && items.length === 0 && !modal && !orderPlacedRef.current) {
      router.replace("/cart");
    }
  }, [isHydrated, items.length, modal, router]);

  if (!isHydrated) return null;
  if (items.length === 0 && !modal) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("ErrorNameRequired"));
      return;
    }
    if (!phone.trim()) {
      setError(t("ErrorPhoneRequired") || "Phone is required");
      return;
    }
    if (!address.trim()) {
      setError(t("ErrorAddressRequired") || "Address is required");
      return;
    }
    setSubmitting(true);
    setError("");

    startTransition(async () => {
      try {
        const result = await createOrder({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || undefined,
          address,
          city: city || undefined,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        });
        if (!result.success) {
          setError(result.error ?? t("ErrorGeneral"));
          setSubmitting(false);
          return;
        }
        orderPlacedRef.current = true;
        clearCart();
        const { orderNumber, orderId } = result.data!;
        if (prefill) {
          router.push(`/checkout/success?ref=${orderNumber}`);
        } else {
          setModal({ orderNumber, orderId });
        }
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
          orderNumber={modal.orderNumber}
          orderId={modal.orderId}
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

              <Field label={t("FullName")} autoFilled={autoFilled.name}>
                <input
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); setAutoFilled((v) => ({ ...v, name: false })); }}
                  placeholder="Your full name"
                  className={fieldClass(autoFilled.name)}
                />
              </Field>

              <Field label={t("Email")} autoFilled={autoFilled.email}>
                <input
                  type="email"
                  disabled={!!prefill}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setAutoFilled((v) => ({ ...v, email: false })); }}
                  placeholder="you@example.com"
                  className={fieldClass(autoFilled.email)}
                />
              </Field>

              <Field label={t("Phone")} autoFilled={autoFilled.phone}>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setAutoFilled((v) => ({ ...v, phone: false })); }}
                  placeholder="+216 XX XXX XXX"
                  className={fieldClass(autoFilled.phone)}
                />
              </Field>

              <Field label={t("Address")} autoFilled={autoFilled.address}>
                <div className="relative">
                  <input
                    required
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setAutoFilled((v) => ({ ...v, address: false })); setSelectedAddressKey(null); }}
                    onFocus={() => setAddressDropdownOpen(true)}
                    onClick={() => setAddressDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setAddressDropdownOpen(false), 100)}
                    placeholder="Street address"
                    className={fieldClass(autoFilled.address)}
                    autoComplete="off"
                  />
                  {addressDropdownOpen && pastAddresses.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-lg">
                      <p className="flex items-center gap-1.5 border-b border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)]">
                        <MapPin className="h-3 w-3" />
                        Saved addresses
                      </p>
                      {pastAddresses.map((p) => {
                        const key = `${p.address}|${p.city}`;
                        const selected = selectedAddressKey === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyPastAddress(p)}
                            className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                              selected ? "bg-blue-50 text-blue-900" : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                            }`}
                          >
                            <span className="truncate">{p.address}</span>
                            {p.city && <span className="shrink-0 text-xs text-[var(--color-muted)]">{p.city}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Field>

              <Field label={t("City")} autoFilled={autoFilled.city}>
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setAutoFilled((v) => ({ ...v, city: false })); setSelectedAddressKey(null); }}
                  className={fieldClass(autoFilled.city)}
                >
                  <option value="">Select a city</option>
                  {city && !TUNISIA_CITIES.includes(city) && <option value={city}>{city}</option>}
                  {TUNISIA_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
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
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="h-12 w-10 flex-shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-10 flex-shrink-0 rounded-lg bg-[var(--color-border)]" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--color-text)]">{item.productName}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {[item.size && `${t("Size")} ${item.size}`, item.colorName].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-[var(--color-border)] pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">{t("Subtotal")}</span>
                  <span className="font-semibold text-[var(--color-text)]">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">{t("Shipping")}</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {deliveryFee === 0 ? t("Free") : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-3 flex justify-between">
                <span className="font-bold text-[var(--color-text)]">{t("Total")}</span>
                <span className="font-bold text-[var(--color-text)]">{formatPrice(total + deliveryFee)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  children,
  autoFilled,
}: {
  label: string;
  children: React.ReactNode;
  autoFilled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-text)]">
        {label}
        {autoFilled && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            <Sparkles className="h-2.5 w-2.5" />
            Auto-filled
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition disabled:cursor-not-allowed disabled:bg-[var(--color-bg)] disabled:text-[var(--color-muted)]";

function fieldClass(autoFilled: boolean): string {
  if (!autoFilled) return inp;
  return `${inp} border-blue-300 bg-blue-50`;
}
