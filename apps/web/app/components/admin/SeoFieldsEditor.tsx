"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronUp, ImageOff, Images, Loader2, Search, Sparkles, Upload, X } from "lucide-react";
import { KeywordsInput } from "./KeywordsInput";

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

export type SeoFieldsValue = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
};

export const EMPTY_SEO_FIELDS: SeoFieldsValue = {
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ogImage: "",
};

function CharCounter({ length, max }: { length: number; max: number }) {
  const over = length > max;
  return (
    <p className={`mt-1 text-xs ${over ? "font-semibold text-red-600" : "text-[var(--color-muted)]"}`}>
      {length}/{max} characters{over ? " — longer than recommended" : ""}
    </p>
  );
}

/**
 * Collapsible SEO section shared by the Product and Category admin forms.
 * All fields are optional — left blank, the public pages auto-generate
 * title/description/image from the name, description, and main photo.
 */
export function SeoFieldsEditor({
  value,
  onChange,
  onUploadImage,
  onSelectExisting,
  hasExistingImages = false,
  onAutoFill,
  entityLabel = "item",
}: {
  value: SeoFieldsValue;
  onChange: (next: SeoFieldsValue) => void;
  onUploadImage?: (file: File) => Promise<string>;
  /** Opens a picker over images already uploaded elsewhere in this form. */
  onSelectExisting?: () => void;
  hasExistingImages?: boolean;
  /** Fills title/description/keywords from the entity's name, description, category, and colors. */
  onAutoFill?: () => void;
  entityLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputId = useId();

  function set<K extends keyof SeoFieldsValue>(key: K, v: SeoFieldsValue[K]) {
    onChange({ ...value, [key]: v });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await onUploadImage(file);
      set("ogImage", url);
    } catch {
      setUploadError("Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
          <Search className="h-4 w-4 text-[var(--color-accent)]" />
          SEO &amp; Référencement
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Optional
          </span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
        )}
      </button>

      {open && (
        <div className="space-y-4 border-t border-[var(--color-border)] bg-white px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--color-muted)]">
              Leave blank to auto-generate from this {entityLabel}&apos;s name, description, and main photo.
            </p>
            {onAutoFill && (
              <button
                type="button"
                onClick={onAutoFill}
                title={`Fill title, description, and keywords from this ${entityLabel}'s details`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Fill automatically
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-muted)]">SEO Title</label>
            <input
              value={value.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              className={inp}
              maxLength={200}
            />
            <CharCounter length={value.seoTitle.length} max={TITLE_MAX} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-muted)]">SEO Description</label>
            <textarea
              rows={2}
              value={value.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
              className={inp}
              maxLength={400}
            />
            <CharCounter length={value.seoDescription.length} max={DESCRIPTION_MAX} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-muted)]">Keywords</label>
            <KeywordsInput value={value.seoKeywords} onChange={(v) => set("seoKeywords", v)} inputClassName={inp} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-muted)]">
              Social share image (optional override)
            </label>
            <div className="flex items-center gap-3">
              {value.ogImage ? (
                <div className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={value.ogImage} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => set("ogImage", "")}
                    title="Remove image"
                    className="absolute right-0.5 top-0.5 hidden rounded-full bg-red-600 p-0.5 text-white group-hover:flex"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-muted)]">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
              <div className="flex min-w-0 flex-1 gap-2">
                <input
                  value={value.ogImage}
                  onChange={(e) => set("ogImage", e.target.value)}
                  placeholder="Paste image URL…"
                  className={`${inp} min-w-0 py-2 text-xs`}
                />
                {onUploadImage && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={fileInputId}
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor={fileInputId}
                      title="Upload from device"
                      className="shrink-0 inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs font-semibold hover:bg-[var(--color-bg)] transition"
                    >
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    </label>
                  </>
                )}
                {onSelectExisting && (
                  <button
                    type="button"
                    disabled={!hasExistingImages}
                    onClick={onSelectExisting}
                    title="Choose from already uploaded images"
                    className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs font-semibold hover:bg-[var(--color-bg)] transition disabled:opacity-40"
                  >
                    <Images className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
            <p className="text-xs text-[var(--color-muted)]">Falls back to the main photo when left empty.</p>
          </div>
        </div>
      )}
    </div>
  );
}
