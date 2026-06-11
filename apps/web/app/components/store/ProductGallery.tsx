"use client";

import { useState } from "react";
import type { ColorImage } from "@/types";

type Props = {
  images: string[];
  colorImages: ColorImage[];
  productName: string;
};

export function ProductGallery({ images, colorImages, productName }: Props) {
  const [activeColor, setActiveColor] = useState<ColorImage | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages =
    activeColor && activeColor.imageUrls.filter(Boolean).length > 0
      ? activeColor.imageUrls
      : images;

  const mainSrc = displayImages[activeIndex] ?? displayImages[0];

  function selectColor(color: ColorImage) {
    if (activeColor?.name === color.name) {
      setActiveColor(null);
      setActiveIndex(0);
    } else {
      setActiveColor(color);
      setActiveIndex(0);
    }
  }

  return (
    <div className="flex gap-3">

      {/* ── Gallery (left / main) ── */}
      <div className="flex-1 space-y-3">
        {/* Main image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          {mainSrc ? (
            <img
              key={mainSrc}
              src={mainSrc}
              alt={activeColor ? `${productName} — ${activeColor.name}` : productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
              No photo
            </div>
          )}

          {activeColor && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
              <div
                className="h-3 w-3 rounded-full border border-white/40"
                style={{ backgroundColor: activeColor.hex }}
              />
              <span className="text-xs font-semibold text-white">{activeColor.name}</span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
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

        {activeColor && (
          <button
            onClick={() => { setActiveColor(null); setActiveIndex(0); }}
            className="text-xs text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          >
            ← Show all photos
          </button>
        )}
      </div>

      {/* ── Color circles (right column) ── */}
      {colorImages.length > 0 && (
        <div className="flex flex-col gap-3 pt-1">
          {colorImages.map((color) => {
            const isActive = activeColor?.name === color.name;
            return (
              <button
                key={color.name}
                onClick={() => selectColor(color)}
                title={color.name}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`h-8 w-8 rounded-full border-2 shadow-sm transition-all ${
                    isActive
                      ? "scale-110 border-[var(--color-accent)] shadow-md"
                      : "border-[var(--color-border)] hover:scale-110 hover:border-[var(--color-accent)]/50"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                <span
                  className={`max-w-[40px] text-center text-[9px] font-medium leading-tight ${
                    isActive ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"
                  }`}
                >
                  {color.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
