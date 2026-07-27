"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/cart-context";
import { formatPrice } from "@/lib/utils";
import { getDeliveryFee } from "@/actions/storeSettingsActions";
import { CartItemVariantEditor } from "@/components/store/CartItemVariantEditor";

export default function CartPage() {
  const { items, total, updateQty, removeItem, isHydrated } = useCart();
  const t = useTranslations("Cart");
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    getDeliveryFee().then(setDeliveryFee);
  }, []);

  if (!isHydrated) return null;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-[var(--color-border)]" />
        <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">{t("Empty")}</h1>
        <p className="mt-2 text-[var(--color-muted)]">{t("EmptyDesc")}</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-green-mid)]"
        >
          {t("Continue")} <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("Title")}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Items list */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="h-24 w-20 flex-shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="h-24 w-20 flex-shrink-0 rounded-xl bg-[var(--color-border)]" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition"
                    >
                      {item.productName}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.size && (
                        <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
                          {t("Size")}: {item.size}
                        </span>
                      )}
                      {item.colorName && (
                        <span className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
                          {item.colorHex && (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          )}
                          {item.colorName}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <CartItemVariantEditor item={item} />
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 rounded-lg p-1 text-[var(--color-muted)] transition hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-semibold text-[var(--color-text)]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-[var(--color-text)]">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-white p-6 space-y-4">
            <h2 className="font-bold text-[var(--color-text)]">{t("OrderSummary")}</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">{t("Subtotal")}</span>
                <span className="font-semibold text-[var(--color-text)]">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">{t("Shipping")}</span>
                <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : "text-[var(--color-text)]"}`}>
                  {deliveryFee === 0 ? t("Free") : formatPrice(deliveryFee)}
                </span>
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-3 flex justify-between">
              <span className="font-bold text-[var(--color-text)]">{t("Total")}</span>
              <span className="font-bold text-[var(--color-text)]">{formatPrice(total + deliveryFee)}</span>
            </div>

            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)]"
            >
              {t("Checkout")} <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/shop"
              className="block text-center text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            >
              {t("Continue")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
