"use client";

import { useState } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/cart-context";
import { formatPrice } from "@/lib/utils";
import type { SerializedProduct, SerializedProductColor } from "@/types";

export function QuickAddModal({
  product,
  onClose,
}: {
  product: SerializedProduct;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState<SerializedProductColor | null>(
    product.colors.length > 0 ? product.colors[0] : null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const sizes = selectedColor?.sizes ?? [];
  const selectedVariant = sizes.find((s) => s.size === selectedSize) ?? null;
  const availableStock = selectedVariant?.stock ?? null;
  const outOfStock = availableStock !== null && availableStock === 0;
  const needsSize = sizes.length > 0 && !selectedSize;
  const canAdd = !needsSize && !outOfStock && selectedVariant != null;
  const maxQty = availableStock ?? 99;
  const previewImage = selectedColor?.images[0]?.url ?? product.primaryImage;
  const displayPrice = selectedVariant?.priceOverride ?? product.basePrice;

  function selectColor(color: SerializedProductColor) {
    setSelectedColor(color);
    setSelectedSize(null);
    setQty(1);
  }

  function handleConfirm() {
    if (!canAdd || !selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: previewImage,
      unitPrice: displayPrice,
      colorName: selectedColor?.name ?? null,
      colorHex: selectedColor?.hex ?? null,
      size: selectedSize,
      quantity: qty,
      maxStock: availableStock ?? undefined,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {previewImage && (
              <img
                src={previewImage}
                alt={product.name}
                className="h-14 w-12 flex-shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-[var(--color-text)]">{product.name}</p>
              <p className="text-sm font-bold text-[var(--color-text)]">{formatPrice(displayPrice)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {product.colors.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Color{selectedColor ? `: ${selectedColor.name}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectColor(c)}
                  title={c.name}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    selectedColor?.id === c.id
                      ? "border-[var(--color-accent)] scale-110"
                      : "border-transparent hover:scale-105 hover:border-[var(--color-border)]"
                  }`}
                  style={{ backgroundColor: c.hex ?? "#888" }}
                />
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Size{selectedSize ? `: ${selectedSize}` : ""}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((ss) => {
                const isSelected = selectedSize === ss.size;
                const isOut = ss.stock === 0;
                return (
                  <button
                    key={ss.id}
                    type="button"
                    disabled={isOut}
                    onClick={() => {
                      setSelectedSize(ss.size);
                      setQty(1);
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      isOut
                        ? "cursor-not-allowed border-red-200 bg-red-50 text-red-400 line-through"
                        : isSelected
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-accent)]"
                    }`}
                  >
                    {ss.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!needsSize && !outOfStock && selectedVariant && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Quantity
            </p>
            <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[28px] text-center text-sm font-bold text-[var(--color-text)]">{qty}</span>
              <button
                type="button"
                disabled={qty >= maxQty}
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="px-3 py-2 text-[var(--color-muted)] transition hover:text-[var(--color-text)] disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--color-border)] py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold shadow-sm transition ${
              canAdd
                ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-green-mid)]"
                : "cursor-not-allowed bg-[var(--color-border)] text-[var(--color-muted)]"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              Confirm
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
