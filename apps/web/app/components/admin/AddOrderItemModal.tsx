"use client";

import { useState } from "react";
import { Search, Loader2, X, Minus, Plus } from "lucide-react";
import { getPublishedProducts } from "@/actions/productActions";
import { formatPrice } from "@/lib/utils";
import type { SerializedProduct, SerializedProductColor } from "@/types";

export function AddOrderItemModal({
  onAdd,
  onClose,
}: {
  onAdd: (variantId: string, quantity: number) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SerializedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);
  const [selectedColor, setSelectedColor] = useState<SerializedProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  async function handleSearch(q: string) {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const res = await getPublishedProducts({ search: q });
    setLoading(false);
    setResults(res.success ? (res.data ?? []) : []);
  }

  function pickProduct(p: SerializedProduct) {
    setSelectedProduct(p);
    setSelectedColor(p.colors[0] ?? null);
    setSelectedSize(null);
    setQuantity(1);
  }

  function pickColor(c: SerializedProductColor) {
    setSelectedColor(c);
    setSelectedSize(null);
    setQuantity(1);
  }

  const selectedVariant = selectedColor?.sizes.find((s) => s.size === selectedSize) ?? null;

  function handleAdd() {
    if (!selectedVariant) return;
    onAdd(selectedVariant.id, quantity);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <p className="text-sm font-bold text-[var(--color-text)]">Add Product</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65dvh] space-y-4 overflow-y-auto p-5">
          {!selectedProduct ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                />
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
                </div>
              )}
              <div className="space-y-1.5">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickProduct(p)}
                    className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border)] p-2.5 text-left transition hover:border-[var(--color-accent)]"
                  >
                    {p.primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.primaryImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-[var(--color-bg)]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">{p.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{formatPrice(p.basePrice)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-xs text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              >
                ← Back to search
              </button>
              <p className="font-semibold text-[var(--color-text)]">{selectedProduct.name}</p>

              {selectedProduct.colors.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => pickColor(c)}
                        title={c.name}
                        className={`h-8 w-8 rounded-full border-2 transition-transform ${
                          selectedColor?.id === c.id ? "border-[var(--color-accent)] scale-110" : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex ?? "#888" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedColor && selectedColor.sizes.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Size</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedColor.sizes.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        disabled={s.stock === 0}
                        onClick={() => setSelectedSize(s.size)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          s.stock === 0
                            ? "cursor-not-allowed border-red-200 bg-red-50 text-red-400 line-through"
                            : selectedSize === s.size
                              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                              : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-accent)]"
                        }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedVariant && (
                <div className="flex items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Qty</p>
                  <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-[var(--color-muted)]"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-bold text-[var(--color-text)]">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= selectedVariant.stock}
                      onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                      className="px-3 py-1.5 text-[var(--color-muted)] disabled:opacity-30"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-xs text-[var(--color-muted)]">{selectedVariant.stock} in stock</span>
                </div>
              )}
            </>
          )}
        </div>

        {selectedProduct && (
          <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedVariant}
              onClick={handleAdd}
              className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-green-mid)] disabled:opacity-40"
            >
              Add to Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
