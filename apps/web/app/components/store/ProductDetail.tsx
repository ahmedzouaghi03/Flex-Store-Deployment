"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProductGallery } from "./ProductGallery";
import { ProductActions } from "./ProductActions";
import { formatPrice } from "@/lib/utils";
import type { SerializedProductColor } from "@/types";

type Props = {
  productId: string;
  productSlug: string;
  productName: string;
  basePrice: number;
  description: string | null;
  categoryName?: string | null;
  colors: SerializedProductColor[];
  mainImages: string[];
};

export function ProductDetail({
  productId,
  productSlug,
  productName,
  basePrice,
  description,
  categoryName,
  colors,
  mainImages,
}: Props) {
  const [selectedColor, setSelectedColor] = useState<SerializedProductColor | null>(
    colors.length > 0 ? colors[0] : null,
  );
  const t = useTranslations("Product");

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <ProductGallery
        colors={colors}
        productName={productName}
        mainImages={mainImages}
        selectedColor={selectedColor}
      />

      <div className="flex flex-col">
        {categoryName && (
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {categoryName}
          </p>
        )}

        <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)]">{productName}</h1>

        <div className="mt-4 flex items-center gap-3">
          {basePrice > 0 ? (
            <span className="text-2xl font-bold text-[var(--color-text)]">
              {formatPrice(basePrice)}
            </span>
          ) : (
            <span className="text-lg text-[var(--color-muted)]">Price on request</span>
          )}
        </div>

        {/* Colors — placed directly under the price */}
        {colors.length > 0 && (
          <div className="mt-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              {t("Color")}
              {selectedColor ? `: ${selectedColor.name}` : ""}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c)}
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

        {description && (
          <p className="mt-5 leading-relaxed text-[var(--color-muted)]">{description}</p>
        )}

        <div className="mt-8">
          <ProductActions
            productId={productId}
            productSlug={productSlug}
            productName={productName}
            basePrice={basePrice}
            selectedColor={selectedColor}
          />
        </div>
      </div>
    </div>
  );
}
