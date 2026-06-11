"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Link as LinkIcon, Upload } from "lucide-react";

import { createProduct, updateProduct } from "@/actions/adminActions";
import type { AdminProductDetail, SizeStock } from "@/types";

type ColorRow = { id: string; name: string; hex: string; imageUrls: string[]; urlInput: string };

async function uploadToImgbb(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload-image", { method: "POST", body: fd });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!json.url) throw new Error(json.error ?? "Upload failed");
  return json.url;
}

function uid() { return Math.random().toString(36).slice(2); }

// ── Color name → hex lookup (French + English shoe colors) ─────────────────
const COLOR_NAMES: [string[], string][] = [
  [["noir", "black", "noire"], "#1a1a1a"],
  [["blanc", "white", "blanche"], "#f5f5f5"],
  [["blanc cassé", "off white", "ivoire", "ivory", "crème", "creme", "cream"], "#f5f0e8"],
  [["gris", "grey", "gray", "grise"], "#808080"],
  [["gris clair", "light grey", "light gray"], "#c0c0c0"],
  [["gris foncé", "dark grey", "dark gray", "anthracite"], "#404040"],
  [["rouge", "red"], "#cc2020"],
  [["bordeaux", "burgundy", "wine", "vin", "dark red"], "#722f37"],
  [["rose", "pink"], "#e87090"],
  [["rose poudré", "dusty pink", "rose pâle", "vieux rose", "blush"], "#d4a0a8"],
  [["fuchsia", "magenta"], "#cc2080"],
  [["corail", "coral"], "#ff6b5b"],
  [["orange"], "#e06820"],
  [["pêche", "peche", "peach", "saumon", "salmon"], "#ffad8a"],
  [["jaune", "yellow"], "#e0c020"],
  [["moutarde", "mustard", "jaune moutarde"], "#c8a020"],
  [["doré", "dore", "gold", "golden"], "#d4a017"],
  [["vert", "green"], "#2e8b57"],
  [["vert olive", "olive green", "olive"], "#6b7c2a"],
  [["kaki", "khaki", "kakis"], "#8b8040"],
  [["vert kaki", "army green", "militaire"], "#606030"],
  [["vert sauge", "sage", "sage green"], "#8fad8a"],
  [["vert forêt", "forest green"], "#228b22"],
  [["vert menthe", "mint", "menthe"], "#98d4c0"],
  [["turquoise", "turquoise green"], "#40e0d0"],
  [["bleu", "blue"], "#3070c0"],
  [["bleu marine", "navy", "marine", "navy blue", "bleu nuit"], "#1a2a5e"],
  [["bleu ciel", "sky blue", "bleu clair", "light blue"], "#87ceeb"],
  [["bleu cobalt", "cobalt", "cobalt blue"], "#0047ab"],
  [["bleu royal", "royal blue"], "#2040c0"],
  [["bleu canard", "teal", "canard"], "#006080"],
  [["violet", "purple"], "#6030a0"],
  [["lilas", "lilac", "lavande", "lavender"], "#b898e8"],
  [["prune", "plum"], "#8e4585"],
  [["marron", "brown", "brun"], "#7b4a28"],
  [["caramel", "caramel brown"], "#c68642"],
  [["camel", "camel brown", "chameau"], "#c19a6b"],
  [["noisette", "hazelnut"], "#9b6a3a"],
  [["chocolat", "chocolate"], "#4a2c17"],
  [["cognac", "cognac brown", "rouille"], "#9a4f1e"],
  [["taupe"], "#8a7868"],
  [["beige"], "#d4bfa0"],
  [["nude", "skin", "peau"], "#e8c9a0"],
  [["sable", "sand"], "#c8b080"],
  [["naturel", "natural", "lin", "linen"], "#e0d0b8"],
  [["argent", "silver", "argenté"], "#c0c0c0"],
  [["bronze"], "#cd7f32"],
];

function nameToHex(name: string): string | null {
  const n = name.toLowerCase().trim();
  if (!n) return null;
  for (const [names, hex] of COLOR_NAMES) {
    if (names.some((k) => n === k || n.includes(k) || k.includes(n))) return hex;
  }
  return null;
}

export function ProductForm({ initialData }: { initialData?: AdminProductDetail }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [name, setName]           = useState(initialData?.name ?? "");
  const [price, setPrice]         = useState(initialData ? String(initialData.priceCents / 100) : "");
  const [images, setImages]       = useState<string[]>(initialData?.images ?? []);
  const [imgUrlInput, setImgUrlInput] = useState("");

  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>(initialData?.sizeStocks ?? []);
  const [sizeInput, setSizeInput]   = useState("");

  const [colorRows, setColorRows] = useState<ColorRow[]>(
    initialData?.colorImages.map((c) => ({
      id: uid(), name: c.name, hex: c.hex ?? "#888888", imageUrls: c.imageUrls, urlInput: "",
    })) ?? [],
  );

  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [isFeatured, setIsFeatured]   = useState(initialData?.isFeatured ?? false);
  const [submitting, setSubmitting]   = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState("");

  const mainFileRef  = useRef<HTMLInputElement>(null);
  const colorFileRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // ── Image URL helpers ───────────────────────────────────────────────────

  function addImageUrl() {
    const url = imgUrlInput.trim();
    if (url && !images.includes(url)) setImages((prev) => [...prev, url]);
    setImgUrlInput("");
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  // ── File upload helpers ─────────────────────────────────────────────────

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(files.map(uploadToImgbb));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      setError("Image upload failed. Check your IMGBB_API_KEY in .env.local");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleColorFileUpload(rowId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadToImgbb(file);
      setColorRows((prev) => prev.map((r) =>
        r.id === rowId ? { ...r, imageUrls: [...r.imageUrls, url] } : r,
      ));
    } catch {
      setError("Image upload failed. Check your IMGBB_API_KEY in .env.local");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ── Size helpers ────────────────────────────────────────────────────────

  function addSize() {
    const s = sizeInput.trim();
    if (s && !sizeStocks.some((x) => x.size === s))
      setSizeStocks((prev) => [...prev, { size: s, stock: 99 }]);
    setSizeInput("");
  }

  // ── Color URL helpers ───────────────────────────────────────────────────

  function addColorUrl(rowId: string) {
    setColorRows((prev) => prev.map((r) => {
      if (r.id !== rowId) return r;
      const url = r.urlInput.trim();
      if (!url || r.imageUrls.includes(url)) return { ...r, urlInput: "" };
      return { ...r, imageUrls: [...r.imageUrls, url], urlInput: "" };
    }));
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Shoe name is required."); return; }
    const priceNum = price.trim() === "" ? 0 : parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) { setError("Enter a valid price."); return; }

    setSubmitting(true);
    setError("");

    const input = {
      name: name.trim(),
      priceCents: Math.round(priceNum * 100),
      images,
      sizeStocks,
      colorImages: colorRows.map(({ name, hex, imageUrls }) => ({ name, hex, imageUrls })),
      isPublished,
      isFeatured,
    };

    startTransition(async () => {
      try {
        const result = initialData
          ? await updateProduct(initialData.id, input)
          : await createProduct(input);
        if (!result.success) { setError(result.error ?? "Something went wrong."); setSubmitting(false); return; }
        router.push("/admin/products");
        router.refresh();
      } catch { setError("Something went wrong."); setSubmitting(false); }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Name */}
      <Field label="Shoe Name *">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Flex Runner Pro" className={inp} />
      </Field>

      {/* Price */}
      <Field label="Price (DT)">
        <input type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="4500 (leave empty for TBD)" className={inp} />
      </Field>

      {/* ── Photos via URL ── */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--color-text)]">Product Photos</p>
        <p className="text-xs text-[var(--color-muted)]">
          Paste a direct image URL and click Add. First photo is the main photo.
        </p>

        {/* URL input row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              value={imgUrlInput}
              onChange={(e) => setImgUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
              placeholder="https://example.com/shoe.jpg"
              className={`${inp} pl-9`}
            />
          </div>
          <button
            type="button"
            onClick={addImageUrl}
            disabled={!imgUrlInput.trim() || uploading}
            className="shrink-0 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition disabled:opacity-40"
          >
            Add
          </button>
          {/* File-picker → imgbb upload */}
          <input
            ref={mainFileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => mainFileRef.current?.click()}
            title="Upload from computer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition disabled:opacity-40"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {images.map((url, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--color-border)]">
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%239ca3af' font-size='12'%3EError%3C/text%3E%3C/svg%3E"; }}
                />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1.5 top-1.5 hidden rounded-full bg-red-600 p-0.5 text-white group-hover:flex"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sizes + Stock */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-[var(--color-text)]">Sizes &amp; Stock</p>
        <p className="text-xs text-[var(--color-muted)]">Stock 0 = sold out (shown in red to customers)</p>
        {sizeStocks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sizeStocks.map((ss) => (
              <div
                key={ss.size}
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
                  ss.stock === 0
                    ? "border-red-200 bg-red-50"
                    : "border-[var(--color-border)] bg-white"
                }`}
              >
                <span className={`text-sm font-semibold ${ss.stock === 0 ? "text-red-500" : "text-[var(--color-text)]"}`}>
                  {ss.size}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={ss.stock}
                  onChange={(e) =>
                    setSizeStocks((prev) =>
                      prev.map((x) =>
                        x.size === ss.size
                          ? { ...x, stock: Math.max(0, parseInt(e.target.value) || 0) }
                          : x,
                      ),
                    )
                  }
                  className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 text-center text-xs font-medium outline-none focus:border-[var(--color-accent)]"
                />
                <button
                  type="button"
                  onClick={() => setSizeStocks((prev) => prev.filter((x) => x.size !== ss.size))}
                  className="text-[var(--color-muted)] hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSize(); } }}
            placeholder="Type a size and press Enter (e.g. 42, XL)"
            className={`${inp} flex-1`}
          />
          <button type="button" onClick={addSize} className="shrink-0 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition">
            Add
          </button>
        </div>
      </div>

      {/* Colors with URL photos */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-[var(--color-text)]">Colors &amp; Photos</p>
        <p className="text-xs text-[var(--color-muted)]">
          Each color can have multiple photo URLs. Paste a link and click Add.
        </p>

        {colorRows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-4 space-y-3">
            {/* Color picker + name */}
            <div className="flex items-center gap-3">
              <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-[var(--color-border)] shadow-sm hover:border-[var(--color-accent)] transition">
                <div className="h-full w-full" style={{ backgroundColor: row.hex }} />
                <input
                  type="color"
                  value={row.hex}
                  onChange={(e) => setColorRows((prev) => prev.map((r) => r.id === row.id ? { ...r, hex: e.target.value } : r))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
              <input
                value={row.name}
                onChange={(e) => {
                  const n = e.target.value;
                  const detectedHex = nameToHex(n);
                  setColorRows((prev) => prev.map((r) =>
                    r.id === row.id
                      ? { ...r, name: n, ...(detectedHex ? { hex: detectedHex } : {}) }
                      : r,
                  ));
                }}
                placeholder="e.g. Noir, Bordeaux, Camel…"
                className={`${inp} flex-1`}
              />
              <button
                type="button"
                onClick={() => setColorRows((prev) => prev.filter((r) => r.id !== row.id))}
                className="shrink-0 rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-red-50 hover:text-red-500 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Color URL input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  value={row.urlInput}
                  onChange={(e) => setColorRows((prev) => prev.map((r) => r.id === row.id ? { ...r, urlInput: e.target.value } : r))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColorUrl(row.id); } }}
                  placeholder="https://example.com/photo.jpg"
                  className={`${inp} py-2 pl-8 text-xs`}
                />
              </div>
              <button
                type="button"
                onClick={() => addColorUrl(row.id)}
                disabled={!row.urlInput.trim() || uploading}
                className="shrink-0 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition disabled:opacity-40"
              >
                Add
              </button>
              {/* File-picker → imgbb upload */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(el) => { if (el) colorFileRefs.current.set(row.id, el); }}
                onChange={(e) => handleColorFileUpload(row.id, e)}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => colorFileRefs.current.get(row.id)?.click()}
                title="Upload from computer"
                className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition disabled:opacity-40"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Color photo thumbnails */}
            {row.imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {row.imageUrls.map((url, pi) => (
                  <div key={pi} className="group relative h-16 w-16 overflow-hidden rounded-xl border border-[var(--color-border)]">
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='32' y='36' text-anchor='middle' fill='%239ca3af' font-size='9'%3EErr%3C/text%3E%3C/svg%3E"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setColorRows((prev) => prev.map((r) =>
                        r.id === row.id
                          ? { ...r, imageUrls: r.imageUrls.filter((_, i) => i !== pi) }
                          : r,
                      ))}
                      className="absolute right-0.5 top-0.5 hidden rounded-full bg-red-600 p-0.5 text-white group-hover:flex"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setColorRows((prev) => [...prev, { id: uid(), name: "", hex: "#888888", imageUrls: [], urlInput: "" }])}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm font-medium text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          <Plus className="h-4 w-4" /> Add Color
        </button>
      </div>

      {/* Visibility */}
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 space-y-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 rounded accent-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">Published — visible to store visitors</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded accent-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">Featured — shown on the homepage</span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60 active:scale-95"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Add Shoe"}
        </button>
        <a href="/admin/products" className="rounded-xl border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition">
          Cancel
        </a>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-[var(--color-text)]">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";
