"use client";

import { useState, useEffect } from "react";
import type { SerializedProductColor } from "@/types";

type Props = {
  colors: SerializedProductColor[];
  productName: string;
  mainImages?: string[];
  selectedColor: SerializedProductColor | null;
};

export function ProductGallery({ colors, productName, mainImages = [], selectedColor }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = (() => {
    if (selectedColor) {
      return selectedColor.images.length > 0
        ? selectedColor.images.map((i) => i.url)
        : mainImages;
    }
    return mainImages.length > 0
      ? mainImages
      : colors.flatMap((c) => c.images.map((i) => i.url));
  })();

  const mainSrc = displayImages[activeIndex] ?? displayImages[0];

  // jump back to the first photo whenever the selected color changes
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedColor?.id]);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
        {mainSrc ? (
          <img
            key={mainSrc}
            src={mainSrc}
            alt={selectedColor ? `${productName} — ${selectedColor.name}` : productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
            No photo
          </div>
        )}

        {selectedColor && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
            {selectedColor.hex && (
              <div
                className="h-3 w-3 rounded-full border border-white/40"
                style={{ backgroundColor: selectedColor.hex }}
              />
            )}
            <span className="text-xs font-semibold text-white">{selectedColor.name}</span>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {displayImages.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActiveIndex(i)}
              className={`aspect-square overflow-hidden rounded-xl border-2 transition ${
                activeIndex === i
                  ? "border-[var(--color-accent)] shadow-sm"
                  : "border-[var(--color-border)] hover:border-[var(--color-green-light)]"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
