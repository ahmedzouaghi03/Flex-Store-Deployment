"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, ImageIcon } from "lucide-react";
import { saveHeroSettings } from "@/actions/storeSettingsActions";
import Uploader from "./Uploader";
import { SaveButton } from "./HeroTextEditor";

export type HeroOverlayCard = { label: string; year: string; collection: string };

type Props = {
  initialImageUrl: string | null;
  initialOverlayCard: HeroOverlayCard;
  onUploaded?: (url: string) => void;
  onOverlayCardChange?: (v: HeroOverlayCard) => void;
};

export function HeroPhotoUpload({
  initialImageUrl,
  initialOverlayCard,
  onUploaded,
  onOverlayCardChange,
}: Props) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [imgFailed, setImgFailed] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadPending, startUploadTransition] = useTransition();

  const [card, setCard] = useState(initialOverlayCard);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  function handleUploadComplete(res: { ufsUrl: string; url: string }[]) {
    const uploaded = res[0]?.ufsUrl;
    if (!uploaded) return;
    setUploadError("");
    setUploadSuccess(false);
    startUploadTransition(async () => {
      const result = await saveHeroSettings({ heroImage: uploaded });
      if (result.success) {
        setImageUrl(uploaded);
        setImgFailed(false);
        setUploadSuccess(true);
        onUploaded?.(uploaded);
      } else {
        setUploadError(result.error ?? "Failed to save photo");
      }
    });
  }

  function handleCardChange(field: keyof HeroOverlayCard, value: string) {
    const next = { ...card, [field]: value };
    setCard(next);
    setSaved(false);
    onOverlayCardChange?.(next);
  }

  function handleSaveCard() {
    setSaveError("");
    startTransition(async () => {
      const res = await saveHeroSettings({
        heroOverlayCardLabel: card.label,
        heroOverlayCardYear: card.year,
        heroOverlayCardCollection: card.collection,
      });
      if (res.success) setSaved(true);
      else setSaveError(res.error ?? "Failed to save");
    });
  }

  const inp =
    "w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

  return (
    <div className="space-y-6">
      {/* Photo upload */}
      <div className="max-w-lg space-y-4">
        <div
          className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
          style={{ aspectRatio: "4/5", maxHeight: 420 }}
        >
          {imageUrl && !imgFailed ? (
            <img
              key={imageUrl}
              src={imageUrl}
              alt="Hero photo"
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--color-muted)]">
              <ImageIcon className="h-12 w-12 opacity-30" />
              <p className="text-sm">No hero photo yet</p>
            </div>
          )}

          {/* floating card overlay preview */}
          <div className="absolute bottom-3 left-3 rounded-xl border border-white/20 bg-black/40 px-3 py-2 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{card.label}</p>
            <p className="text-sm font-black text-white">{card.year}</p>
            {card.collection && <p className="text-[10px] text-white/70">{card.collection}</p>}
          </div>

          {uploadPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            </div>
          )}
          {uploadSuccess && !uploadPending && (
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
              <CheckCircle2 className="h-3.5 w-3.5" /> Photo saved!
            </div>
          )}
        </div>

        {uploadError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</p>
        )}

        <Uploader
          endpoint="storeImage"
          buttonText={imageUrl ? "Upload New Photo" : "Upload Photo"}
          handleUploadComplete={handleUploadComplete}
        />
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
              Collection name (optional)
            </label>
            <input
              value={card.collection}
              onChange={(e) => handleCardChange("collection", e.target.value)}
              placeholder="Air Max Series"
              className={inp}
            />
          </div>
        </div>

        {/* live mini preview of the card */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-green-dark)] px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{card.label}</p>
            <p className="text-base font-black text-white">{card.year}</p>
            {card.collection && <p className="text-[10px] text-white/70">{card.collection}</p>}
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
