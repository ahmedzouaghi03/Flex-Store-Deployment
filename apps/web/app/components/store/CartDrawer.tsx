"use client";

import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/cart-context";
import { formatPrice } from "@/lib/utils";
import { CartItemVariantEditor } from "./CartItemVariantEditor";

export function CartDrawer() {
  const { items, count, total, drawerOpen, closeDrawer, updateQty, removeItem } = useCart();

  if (!drawerOpen) return null;

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={closeDrawer}
      />

      {/* drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="font-bold text-[var(--color-text)]">
              Cart {count > 0 && <span className="text-[var(--color-muted)]">({count})</span>}
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <ShoppingBag className="h-12 w-12 text-[var(--color-border)]" />
              <p className="font-semibold text-[var(--color-text)]">Your cart is empty</p>
              <p className="text-sm text-[var(--color-muted)]">Add some shoes to get started</p>
              <button
                onClick={closeDrawer}
                className="mt-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--color-green-mid)]"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-18 w-16 flex-shrink-0 rounded-xl object-cover"
                      style={{ height: 72 }}
                    />
                  ) : (
                    <div className="h-18 w-16 flex-shrink-0 rounded-xl bg-[var(--color-border)]" style={{ height: 72 }} />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--color-text)] text-sm">{item.productName}</p>
                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      {item.size && (
                        <span className="rounded-full bg-white border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
                          {item.size}
                        </span>
                      )}
                      {item.colorName && (
                        <span className="flex items-center gap-1 rounded-full bg-white border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
                          {item.colorHex && (
                            <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/50" style={{ backgroundColor: item.colorHex }} />
                          )}
                          {item.colorName}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                      {formatPrice(item.unitPrice)}
                    </p>
                    <div className="mt-1">
                      <CartItemVariantEditor item={item} />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-white">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[20px] text-center text-sm font-semibold text-[var(--color-text)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-[var(--color-muted)] transition hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-muted)]">Subtotal</span>
              <span className="font-bold text-[var(--color-text)]">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)]"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="block w-full rounded-xl border border-[var(--color-border)] py-3 text-center text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
            >
              View cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
