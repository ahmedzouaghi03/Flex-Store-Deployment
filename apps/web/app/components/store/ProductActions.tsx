"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/cart-context";
import type { SerializedProductColor } from "@/types";

interface ProductActionsProps {
  productId: string;
  productSlug: string;
  productName: string;
  basePrice: number;
  colors: SerializedProductColor[];
}

export function ProductActions({
  productId,
  productSlug,
  productName,
  basePrice,
  colors,
}: ProductActionsProps) {
  const { addItem } = useCart();
  const t = useTranslations("Product");

  const [selectedColor, setSelectedColor] = useState<SerializedProductColor | null>(
    colors.length > 0 ? colors[0] : null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const sizes = selectedColor?.sizes ?? [];
  const selectedVariant = sizes.find((s) => s.size === selectedSize) ?? null;
  const availableStock = selectedVariant?.stock ?? null;
  const outOfStock = availableStock !== null && availableStock === 0;
  const needsSize = sizes.length > 0 && !selectedSize;
  const canAdd = !needsSize && !outOfStock && selectedVariant != null;
  const maxQty = availableStock ?? 99;
  const lowStock = availableStock !== null && availableStock > 0 && availableStock <= 3;

  function selectColor(color: SerializedProductColor) {
    setSelectedColor(color);
    setSelectedSize(null);
    setQty(1);
  }

  function selectSize(size: string) {
    setSelectedSize(size);
    setQty(1);
  }

  function handleAddToCart() {
    if (!canAdd || !selectedVariant) return;
    const image = selectedColor?.images[0]?.url ?? null;
    const unitPrice = selectedVariant.priceOverride ?? basePrice;

    addItem({
      variantId: selectedVariant.id,
      productId,
      productSlug,
      productName,
      image,
      unitPrice,
      colorName: selectedColor?.name ?? null,
      colorHex: selectedColor?.hex ?? null,
      size: selectedSize,
      quantity: qty,
      maxStock: availableStock ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t("Color")}{selectedColor ? `: ${selectedColor.name}` : ""}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectColor(c)}
                title={c.name}
                className={`h-8 w-8 rounded-full border-2 transition-transform ${
                  selectedColor?.id === c.id
                    ? "border-[var(--color-accent)] scale-110 shadow-md"
                    : "border-transparent hover:scale-105 hover:border-[var(--color-border)]"
                }`}
                style={{ backgroundColor: c.hex ?? "#888" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t("Size")}{selectedSize ? `: ${selectedSize}` : ""}
          </h2>
          <div className="flex flex-wrap gap-2">
            {sizes.map((ss) => {
              const isSelected = selectedSize === ss.size;
              const isOut = ss.stock === 0;
              return (
                <button
                  key={ss.id}
                  type="button"
                  disabled={isOut}
                  onClick={() => selectSize(ss.size)}
                  className={`relative rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    isOut
                      ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed line-through"
                      : isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm"
                      : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {ss.size}
                  {isOut && <span className="ml-1 text-xs font-normal">{t("SoldOut")}</span>}
                </button>
              );
            })}
          </div>
          {needsSize && (
            <p className="mt-2 text-xs text-[var(--color-muted)]">{t("SelectSize")}</p>
          )}
          {lowStock && (
            <p className="mt-2 text-xs font-semibold text-orange-500">
              {t("LowStock", { count: availableStock })}
            </p>
          )}
        </div>
      )}

      {/* Quantity */}
      {!needsSize && !outOfStock && selectedVariant && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t("Quantity")}
          </h2>
          <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-2.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[36px] text-center text-sm font-bold text-[var(--color-text)]">
              {qty}
            </span>
            <button
              type="button"
              disabled={qty >= maxQty}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className="px-3 py-2.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)] disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {availableStock !== null && (
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              {t("Available", { count: availableStock })}
            </p>
          )}
        </div>
      )}

      {/* Add to cart */}
      <button
        type="button"
        disabled={!canAdd}
        onClick={handleAddToCart}
        className={`w-full rounded-2xl px-6 py-4 text-sm font-bold shadow-sm transition active:scale-95 ${
          added
            ? "bg-green-500 text-white"
            : canAdd
            ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-green-mid)]"
            : "cursor-not-allowed bg-[var(--color-border)] text-[var(--color-muted)]"
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          {added
            ? t("AddedToCart")
            : outOfStock
            ? t("OutOfStock")
            : needsSize
            ? t("SelectSize")
            : t("AddToCart")}
        </span>
      </button>
    </div>
  );
}
