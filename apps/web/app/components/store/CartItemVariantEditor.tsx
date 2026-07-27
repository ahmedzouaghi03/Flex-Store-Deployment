"use client";

import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { getProductColors } from "@/actions/productActions";
import { useCart } from "@/cart-context";
import type { CartItem, SerializedProductColor } from "@/types";

export function CartItemVariantEditor({ item }: { item: CartItem }) {
  const { changeVariant } = useCart();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<SerializedProductColor[] | null>(null);
  const [error, setError] = useState("");
  const [pendingColor, setPendingColor] = useState<SerializedProductColor | null>(null);

  async function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (colors) return;
    setLoading(true);
    setError("");
    const result = await getProductColors(item.productId);
    setLoading(false);
    if (result.success) {
      const loaded = result.data ?? [];
      setColors(loaded);
      setPendingColor(loaded.find((c) => c.name === item.colorName) ?? loaded[0] ?? null);
    } else {
      setError(result.error ?? "Failed to load options");
    }
  }

  function applySize(size: string) {
    if (!pendingColor) return;
    const variant = pendingColor.sizes.find((s) => s.size === size);
    if (!variant || variant.stock === 0) return;
    changeVariant(item.variantId, {
      variantId: variant.id,
      productId: item.productId,
      productSlug: item.productSlug,
      productName: item.productName,
      image: pendingColor.images[0]?.url ?? item.image,
      unitPrice: variant.priceOverride ?? item.unitPrice,
      colorName: pendingColor.name,
      colorHex: pendingColor.hex,
      size: variant.size,
      quantity: item.quantity,
      maxStock: variant.stock,
    });
    setOpen(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
      >
        <Pencil className="h-3 w-3" />
        {open ? "Close" : "Change"}
      </button>

      {open && (
        <div className="mt-2 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading options…
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {colors && colors.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Color
              </p>
              <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPendingColor(c)}
                    title={c.name}
                    className={`h-6 w-6 rounded-full border-2 transition-transform ${
                      pendingColor?.id === c.id
                        ? "border-[var(--color-accent)] scale-110"
                        : "border-transparent hover:scale-105 hover:border-[var(--color-border)]"
                    }`}
                    style={{ backgroundColor: c.hex ?? "#888" }}
                  />
                ))}
              </div>
            </div>
          )}

          {pendingColor && pendingColor.sizes.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Size
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pendingColor.sizes.map((s) => {
                  const isCurrent = item.size === s.size && item.colorName === pendingColor.name;
                  const isOut = s.stock === 0;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isOut}
                      onClick={() => applySize(s.size)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                        isOut
                          ? "cursor-not-allowed border-red-200 bg-red-50 text-red-400 line-through"
                          : isCurrent
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                          : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-accent)]"
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
