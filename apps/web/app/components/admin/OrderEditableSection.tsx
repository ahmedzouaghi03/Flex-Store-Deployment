"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Minus, Trash2, Pencil, Loader2, Package } from "lucide-react";

import {
  addOrderItem,
  updateOrderItemQuantity,
  updateOrderItemVariant,
  removeOrderItem,
  updateOrderDiscount,
} from "@/actions/orderActions";
import { getProductColors } from "@/actions/productActions";
import { formatPrice } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";
import { AddOrderItemModal } from "./AddOrderItemModal";
import type { SerializedOrderItem, SerializedProductColor, DiscountType } from "@/types";

function VariantEditor({
  item,
  isPending,
  onChanged,
}: {
  item: SerializedOrderItem;
  isPending: boolean;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<SerializedProductColor[] | null>(null);
  const [pendingColor, setPendingColor] = useState<SerializedProductColor | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (colors) return;
    setLoading(true);
    const res = await getProductColors(item.productId);
    setLoading(false);
    if (res.success) {
      const loaded = res.data ?? [];
      setColors(loaded);
      setPendingColor(loaded.find((c) => c.name === item.colorName) ?? loaded[0] ?? null);
    } else {
      setError(res.error ?? "Failed to load options");
    }
  }

  function pick(size: string) {
    if (!pendingColor) return;
    const variant = pendingColor.sizes.find((s) => s.size === size);
    if (!variant || variant.stock === 0) return;
    setOpen(false);
    startTransition(async () => {
      const res = await updateOrderItemVariant(item.id, variant.id);
      if (res.success) onChanged();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] transition hover:text-[var(--color-text)] disabled:opacity-40"
      >
        <Pencil className="h-3 w-3" /> {open ? "Close" : "Change"}
      </button>
      {open && (
        <div className="mt-2 space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          {colors && (
            <div className="flex flex-wrap gap-1.5">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPendingColor(c)}
                  title={c.name}
                  className={`h-6 w-6 rounded-full border-2 transition-transform ${
                    pendingColor?.id === c.id ? "border-[var(--color-accent)] scale-110" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex ?? "#888" }}
                />
              ))}
            </div>
          )}
          {pendingColor && (
            <div className="flex flex-wrap gap-1.5">
              {pendingColor.sizes.map((s) => {
                const isCurrent = item.size === s.size && item.colorName === pendingColor.name;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={s.stock === 0}
                    onClick={() => pick(s.size)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      s.stock === 0
                        ? "cursor-not-allowed border-red-200 bg-red-50 text-red-400 line-through"
                        : isCurrent
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                          : "border-[var(--color-border)] bg-white text-[var(--color-text)]"
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function OrderEditableSection({
  orderId,
  items,
  subtotal,
  shippingCost,
  discountType,
  discountValue,
  discountAmount,
  total,
}: {
  orderId: string;
  items: SerializedOrderItem[];
  subtotal: number;
  shippingCost: number;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  total: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const [discountTypeInput, setDiscountTypeInput] = useState<DiscountType | "NONE">(discountType ?? "NONE");
  const [discountValueInput, setDiscountValueInput] = useState(discountValue != null ? String(discountValue) : "");
  const [discountError, setDiscountError] = useState("");

  function handleQuantity(item: SerializedOrderItem, quantity: number) {
    if (quantity < 1) return;
    startTransition(async () => {
      const res = await updateOrderItemQuantity(item.id, quantity);
      if (res.success) router.refresh();
    });
  }

  function handleRemove(itemId: string) {
    setRemoveConfirmId(null);
    startTransition(async () => {
      const res = await removeOrderItem(itemId);
      if (res.success) router.refresh();
    });
  }

  function handleAddProduct(variantId: string, quantity: number) {
    setAddOpen(false);
    startTransition(async () => {
      const res = await addOrderItem(orderId, variantId, quantity);
      if (res.success) router.refresh();
    });
  }

  function handleApplyDiscount() {
    setDiscountError("");
    if (discountTypeInput === "NONE") {
      startTransition(async () => {
        const res = await updateOrderDiscount(orderId, { type: null, value: null });
        if (res.success) router.refresh();
        else setDiscountError(res.error ?? "Failed to update discount");
      });
      return;
    }
    const value = parseFloat(discountValueInput);
    if (isNaN(value) || value <= 0) {
      setDiscountError("Enter a valid amount");
      return;
    }
    startTransition(async () => {
      const res = await updateOrderDiscount(orderId, { type: discountTypeInput, value });
      if (res.success) router.refresh();
      else setDiscountError(res.error ?? "Failed to update discount");
    });
  }

  const removingItem = items.find((i) => i.id === removeConfirmId) ?? null;
  const canRemove = items.length > 1;

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
            <Package size={15} />
            Items ({items.length})
          </h2>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add Product
          </button>
        </div>
        <ul className="divide-y divide-[var(--color-border)]">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-4 px-5 py-4">
              {item.productImage ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)]">
                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="64px" />
                </div>
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--color-text)]">{item.productName}</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  {item.size && `Size: ${item.size}`}
                  {item.colorName && ` · Color: ${item.colorName}`}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-white">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleQuantity(item, item.quantity - 1)}
                      className="px-2 py-1 text-[var(--color-muted)] disabled:opacity-30"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[24px] text-center text-xs font-bold text-[var(--color-text)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleQuantity(item, item.quantity + 1)}
                      className="px-2 py-1 text-[var(--color-muted)] disabled:opacity-30"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <VariantEditor item={item} isPending={isPending} onChanged={() => router.refresh()} />

                  <button
                    type="button"
                    disabled={isPending || !canRemove}
                    title={canRemove ? "Remove" : "Cancel the order instead"}
                    onClick={() => setRemoveConfirmId(item.id)}
                    className="text-[var(--color-muted)] transition hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-bold text-[var(--color-text)]">{formatPrice(item.totalPrice)}</p>
                {item.quantity > 1 && (
                  <p className="text-xs text-[var(--color-muted)]">{formatPrice(item.unitPrice)} each</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Discount editor */}
        <div className="space-y-2 border-t border-[var(--color-border)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Discount</p>
          {discountError && <p className="text-xs text-red-600">{discountError}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={discountTypeInput}
              onChange={(e) => setDiscountTypeInput(e.target.value as DiscountType | "NONE")}
              className="rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text)] outline-none"
            >
              <option value="NONE">None</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed amount (TND)</option>
            </select>
            {discountTypeInput !== "NONE" && (
              <input
                type="number"
                min="0"
                step="0.001"
                value={discountValueInput}
                onChange={(e) => setDiscountValueInput(e.target.value)}
                placeholder={discountTypeInput === "PERCENTAGE" ? "e.g. 10" : "e.g. 20.000"}
                className="w-28 rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
              />
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={handleApplyDiscount}
              className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="space-y-2 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-muted)]">Subtotal</span>
            <span className="font-semibold text-[var(--color-text)]">{formatPrice(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-muted)]">Discount</span>
              <span className="font-semibold text-red-600">−{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-muted)]">Delivery fee</span>
            <span className="font-semibold text-[var(--color-text)]">
              {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2">
            <span className="text-sm font-semibold text-[var(--color-text)]">Total</span>
            <span className="text-lg font-bold text-[var(--color-text)]">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {removingItem && (
        <ConfirmDialog
          title="Remove this item?"
          message={`"${removingItem.productName}" (${removingItem.size}, ${removingItem.colorName}) will be removed from the order and its stock restored.`}
          isPending={isPending}
          onConfirm={() => handleRemove(removingItem.id)}
          onCancel={() => setRemoveConfirmId(null)}
        />
      )}

      {addOpen && <AddOrderItemModal onAdd={handleAddProduct} onClose={() => setAddOpen(false)} />}
    </div>
  );
}
