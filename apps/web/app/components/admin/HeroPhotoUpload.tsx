"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, Loader2, CheckCircle2, ImageIcon } from "lucide-react";
import { savePhotoCard } from "@/actions/storeConfigActions";
import type { StoreConfig } from "@/lib/store-config";
import { SaveButton } from "./HeroTextEditor";

type Props = {
  onUploaded?: (v: number) => void;
  initialPhotoCard: StoreConfig["photoCard"];
  onPhotoCardChange?: (v: StoreConfig["photoCard"]) => void;
};

export function HeroPhotoUpload({ onUploaded, initialPhotoCard, onPhotoCardChange }: Props) {
  const [preview, setPreview]   = useState<string | null>(null);
  const [version, setVersion]   = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [card, setCard] = useState(initialPhotoCard);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved]   = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadSuccess(false);
    setUploadError("");
    setPreview(URL.createObjectURL(file));
    setImgFailed(false);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/hero", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      const v = Date.now();
      setVersion(v);
      onUploaded?.(v);
      setPreview(null);
      setUploadSuccess(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleCardChange(field: keyof typeof card, value: string) {
    const next = { ...card, [field]: value };
    setCard(next);
    setSaved(false);
    onPhotoCardChange?.(next);
  }

  function handleSaveCard() {
    setSaveError("");
    startTransition(async () => {
      const res = await savePhotoCard(card);
      if (res.success) setSaved(true);
      else setSaveError(res.error ?? "Failed to save");
    });
  }

  const heroSrc = preview ?? (version > 0 ? `/hero-photo.jpg?v=${version}` : `/hero-photo.jpg`);

  const inp = "w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

  return (
    <div className="space-y-6">
      {/* Photo upload */}
      <div className="max-w-lg space-y-4">
        <div
          className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
          style={{ aspectRatio: "4/5", maxHeight: 420 }}
        >
          {imgFailed ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--color-muted)]">
              <ImageIcon className="h-12 w-12 opacity-30" />
              <p className="text-sm">No hero photo yet</p>
            </div>
          ) : (
            <img
              key={heroSrc}
              src={heroSrc}
              alt="Hero photo"
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          )}

          {/* floating card overlay preview */}
          <div className="absolute bottom-3 left-3 rounded-xl border border-white/20 bg-black/40 px-3 py-2 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{card.label}</p>
            <p className="text-sm font-black text-white">{card.year}</p>
          </div>

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            </div>
          )}
          {uploadSuccess && !uploading && (
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
              <CheckCircle2 className="h-3.5 w-3.5" /> Photo saved!
            </div>
          )}
        </div>

        {uploadError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</p>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload New Photo"}
        </button>
        <p className="text-xs text-[var(--color-muted)]">
          Recommended: portrait format (4:5), at least 800 × 1000 px. JPG or PNG.
        </p>
      </div>

      {/* Card text editor */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 space-y-4 max-w-lg">
        <div>
          <p className="text-sm font-bold text-[var(--color-text)]">Photo overlay card</p>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            The small floating label shown at the bottom-left of the photo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
              Label (eyebrow)
            </label>
            <input
              value={card.label}
              onChange={(e) => handleCardChange("label", e.target.value)}
              placeholder="Collection"
              className={inp}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
              Year / subtitle
            </label>
            <input
              value={card.year}
              onChange={(e) => handleCardChange("year", e.target.value)}
              placeholder="2025"
              className={inp}
            />
          </div>
        </div>

        {/* live mini preview of the card */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-green-dark)] px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{card.label}</p>
            <p className="text-base font-black text-white">{card.year}</p>
          </div>
          <p className="text-xs text-[var(--color-muted)]">Card preview</p>
        </div>

        {saveError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{saveError}</p>
        )}
        <SaveButton pending={pending} saved={saved} onClick={handleSaveCard} />
      </div>
    </div>
  );
}
