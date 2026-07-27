"use client";

import { useState } from "react";
import { X, Check, ImagePlus } from "lucide-react";

const FALLBACK_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3C/svg%3E";

export function ImagePickerModal({
  images,
  alreadySelected,
  onConfirm,
  onClose,
}: {
  images: string[];
  alreadySelected: string[];
  onConfirm: (urls: string[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(url: string) {
    setSelected((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <p className="text-sm font-bold text-[var(--color-text)]">Choose from uploaded images</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-5">
          {images.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-muted)]">
              No images uploaded yet — add a photo first.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((url) => {
                const already = alreadySelected.includes(url);
                const isSelected = selected.includes(url);
                return (
                  <button
                    key={url}
                    type="button"
                    disabled={already}
                    onClick={() => toggle(url)}
                    className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                      already
                        ? "cursor-not-allowed border-[var(--color-border)] opacity-40"
                        : isSelected
                          ? "border-[var(--color-accent)] shadow-md"
                          : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_SRC;
                      }}
                    />
                    {(isSelected || already) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="rounded-full bg-[var(--color-accent)] p-1">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    )}
                    {already && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[8px] font-semibold text-white">
                        Added
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-4">
          <p className="text-xs text-[var(--color-muted)]">{selected.length} selected</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => {
                onConfirm(selected);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-40"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Add{selected.length > 0 ? ` (${selected.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
