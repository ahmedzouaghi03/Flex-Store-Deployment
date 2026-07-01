"use client";

import { useState } from "react";
import type { SerializedProductColor } from "@/types";

type Props = {
  colors: SerializedProductColor[];
  productName: string;
  mainImages?: string[];
};

export function ProductGallery({ colors, productName, mainImages = [] }: Props) {
  const [activeColor, setActiveColor] = useState<SerializedProductColor | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = (() => {
    if (activeColor) {
      return activeColor.images.length > 0
        ? activeColor.images.map((i) => i.url)
        : mainImages;
    }
    return mainImages.length > 0
      ? mainImages
      : colors.flatMap((c) => c.images.map((i) => i.url));
  })();

  const mainSrc = displayImages[activeIndex] ?? displayImages[0];

  function selectColor(color: SerializedProductColor) {
    if (activeColor?.id === color.id) {
      setActiveColor(null);
      setActiveIndex(0);
    } else {
      setActiveColor(color);
      setActiveIndex(0);
    }
  }

  const hasMainImages = mainImages.length > 0;
  const hasColors = colors.length > 0;
  const showCircleRow = hasMainImages || hasColors;

  return (
    <div className="space-y-3">
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
            {activeColor.hex && (
              <div
                className="h-3 w-3 rounded-full border border-white/40"
                style={{ backgroundColor: activeColor.hex }}
              />
            )}
            <span className="text-xs font-semibold text-white">{activeColor.name}</span>
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

      {/* Circle row: Main + Colors */}
      {showCircleRow && (
        <div className="flex items-start gap-4">
          {/* Main photos circle */}
          {hasMainImages && (
            <button
              onClick={() => { setActiveColor(null); setActiveIndex(0); }}
              className="flex flex-col items-center gap-1"
              title="Main photos"
            >
              <div
                className={`h-8 w-8 overflow-hidden rounded-full border-2 shadow-sm transition-all ${
                  activeColor === null
                    ? "scale-110 border-[var(--color-accent)] shadow-md"
                    : "border-[var(--color-border)] hover:scale-110 hover:border-[var(--color-accent)]/50"
                }`}
              >
                {mainImages[0] ? (
                  <img src={mainImages[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-[var(--color-bg)]" />
                )}
              </div>
              <span
                className={`text-[9px] font-medium ${
                  activeColor === null ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"
                }`}
              >
                Main
              </span>
            </button>
          )}

          {/* Color circles */}
          {colors.map((color) => {
            const isActive = activeColor?.id === color.id;
            return (
              <button
                key={color.id}
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
                  style={{ backgroundColor: color.hex ?? "#888" }}
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
