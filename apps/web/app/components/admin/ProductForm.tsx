"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Link as LinkIcon, Upload, Copy, Images, ChevronDown } from "lucide-react";

import { createProduct, updateProduct } from "@/actions/adminActions";
import { ImagePickerModal } from "./ImagePickerModal";
import type { AdminProductDetail } from "@/types";

type CategoryOption = { id: string; name: string; isActive: boolean };

type SizeEntry = { size: string; stock: number };
type ColorRow = {
  id: string;
  name: string;
  hex: string;
  imageUrls: string[];
  urlInput: string;
  sizes: SizeEntry[];
  sizeInput: string;
};

async function uploadToImgbb(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload-image", { method: "POST", body: fd });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!json.url) throw new Error(json.error ?? "Upload failed");
  return json.url;
}

function uid() { return Math.random().toString(36).slice(2); }

// ── Color name → hex ──────────────────────────────────────────────────────────
const COLOR_NAMES: [string[], string][] = [
  [["noir", "black", "noire"], "#1a1a1a"],
  [["blanc", "white", "blanche"], "#f5f5f5"],
  [["blanc cassé", "off white", "ivoire", "ivory", "crème", "cream"], "#f5f0e8"],
  [["gris", "grey", "gray", "grise"], "#808080"],
  [["gris clair", "light grey", "light gray"], "#c0c0c0"],
  [["gris foncé", "dark grey", "dark gray", "anthracite"], "#404040"],
  [["rouge", "red"], "#cc2020"],
  [["bordeaux", "burgundy", "wine", "vin"], "#722f37"],
  [["rose", "pink"], "#e87090"],
  [["rose poudré", "dusty pink", "blush"], "#d4a0a8"],
  [["fuchsia", "magenta"], "#cc2080"],
  [["corail", "coral"], "#ff6b5b"],
  [["orange"], "#e06820"],
  [["pêche", "peach", "saumon", "salmon"], "#ffad8a"],
  [["jaune", "yellow"], "#e0c020"],
  [["moutarde", "mustard"], "#c8a020"],
  [["doré", "dore", "gold"], "#d4a017"],
  [["vert", "green"], "#2e8b57"],
  [["olive", "kaki", "khaki"], "#6b7c2a"],
  [["vert sauge", "sage"], "#8fad8a"],
  [["vert forêt", "forest green"], "#228b22"],
  [["turquoise"], "#40e0d0"],
  [["bleu", "blue"], "#3070c0"],
  [["bleu marine", "navy"], "#1a2a5e"],
  [["bleu ciel", "sky blue"], "#87ceeb"],
  [["bleu cobalt", "cobalt"], "#0047ab"],
  [["bleu canard", "teal"], "#006080"],
  [["violet", "purple"], "#6030a0"],
  [["lilas", "lilac", "lavande", "lavender"], "#b898e8"],
  [["prune", "plum"], "#8e4585"],
  [["marron", "brown", "brun"], "#7b4a28"],
  [["caramel"], "#c68642"],
  [["camel"], "#c19a6b"],
  [["chocolat", "chocolate"], "#4a2c17"],
  [["cognac"], "#9a4f1e"],
  [["taupe"], "#8a7868"],
  [["beige"], "#d4bfa0"],
  [["nude", "skin"], "#e8c9a0"],
  [["sable", "sand"], "#c8b080"],
  [["argent", "silver"], "#c0c0c0"],
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

const inp = "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-[var(--color-text)]">{label}</label>
      {children}
    </div>
  );
}

// ── Per-color sizes+stock editor ──────────────────────────────────────────────
function SizesEditor({
  sizes,
  sizeInput,
  onSizeInputChange,
  onAddSize,
  onStockChange,
  onRemoveSize,
}: {
  sizes: SizeEntry[];
  sizeInput: string;
  onSizeInputChange: (v: string) => void;
  onAddSize: () => void;
  onStockChange: (size: string, stock: number) => void;
  onRemoveSize: (size: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
        Sizes &amp; Stock
      </p>

      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sizes.map((ss) => (
            <div
              key={ss.size}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
                ss.stock === 0
                  ? "border-red-200 bg-red-50"
                  : "border-[var(--color-border)] bg-[var(--color-bg)]"
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
                onChange={(e) => onStockChange(ss.size, Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 rounded-lg border border-[var(--color-border)] bg-white px-2 py-0.5 text-center text-xs font-medium outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="button"
                onClick={() => onRemoveSize(ss.size)}
                className="text-[var(--color-muted)] hover:text-red-500 transition"
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
          onChange={(e) => onSizeInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              onAddSize();
            }
          }}
          placeholder="Size (e.g. 39, 40, 41…) then Enter"
          className={`${inp} min-w-0 py-2 text-xs flex-1`}
        />
        <button
          type="button"
          onClick={onAddSize}
          disabled={!sizeInput.trim()}
          className="shrink-0 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {sizes.length === 0 && (
        <p className="text-xs text-amber-600">⚠ Add at least one size with stock to make this color available.</p>
      )}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function ProductForm({
  initialData,
  categories = [],
}: {
  initialData?: AdminProductDetail;
  categories?: CategoryOption[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [name, setName]     = useState(initialData?.name ?? "");
  const [price, setPrice]   = useState(initialData ? String(initialData.priceCents / 100) : "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [isFeatured, setIsFeatured]   = useState(initialData?.isFeatured ?? false);
  const [submitting, setSubmitting]   = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState("");

  // ── Main product photos ─────────────────────────────────────────────────
  const [mainImages, setMainImages] = useState<string[]>(initialData?.images ?? []);
  const [mainUrlInput, setMainUrlInput] = useState("");
  const mainFileRef = useRef<HTMLInputElement>(null);

  function addMainUrl() {
    const url = mainUrlInput.trim();
    if (!url || mainImages.includes(url)) { setMainUrlInput(""); return; }
    setMainImages((prev) => [...prev, url]);
    setMainUrlInput("");
  }

  async function handleMainFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadToImgbb(file);
      setMainImages((prev) => [...prev, url]);
    } catch {
      setError("Image upload failed. Check IMGBB_API_KEY in .env.local");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const [colorRows, setColorRows] = useState<ColorRow[]>(
    initialData?.colorImages.map((c) => ({
      id: uid(),
      name: c.name,
      hex: c.hex ?? "#888888",
      imageUrls: c.imageUrls,
      urlInput: "",
      sizes: c.sizes ?? [],
      sizeInput: "",
    })) ?? [],
  );

  const colorFileRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // ── Reuse-existing-image picker ──────────────────────────────────────────
  // "main" targets the main product photos list; any other value is a color row id.
  const [pickerTarget, setPickerTarget] = useState<"main" | string | null>(null);

  const allUploadedImages = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const url of [...mainImages, ...colorRows.flatMap((r) => r.imageUrls)]) {
      if (!seen.has(url)) {
        seen.add(url);
        out.push(url);
      }
    }
    return out;
  }, [mainImages, colorRows]);

  const pickerAlreadySelected =
    pickerTarget === "main"
      ? mainImages
      : (colorRows.find((r) => r.id === pickerTarget)?.imageUrls ?? []);

  function handlePickerConfirm(urls: string[]) {
    if (pickerTarget === "main") {
      setMainImages((prev) => [...prev, ...urls.filter((u) => !prev.includes(u))]);
    } else if (pickerTarget) {
      const targetId = pickerTarget;
      setColorRows((prev) =>
        prev.map((r) =>
          r.id === targetId
            ? { ...r, imageUrls: [...r.imageUrls, ...urls.filter((u) => !r.imageUrls.includes(u))] }
            : r,
        ),
      );
    }
  }

  // ── Color helpers ────────────────────────────────────────────────────────
  function updateColor(rowId: string, patch: Partial<ColorRow>) {
    setColorRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  }

  function addColorUrl(rowId: string) {
    setColorRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const url = r.urlInput.trim();
        if (!url || r.imageUrls.includes(url)) return { ...r, urlInput: "" };
        return { ...r, imageUrls: [...r.imageUrls, url], urlInput: "" };
      }),
    );
  }

  async function handleColorFileUpload(rowId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadToImgbb(file);
      setColorRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, imageUrls: [...r.imageUrls, url] } : r)),
      );
    } catch {
      setError("Image upload failed. Check IMGBB_API_KEY in .env.local");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ── Size helpers (per color) ─────────────────────────────────────────────
  function addSizeToColor(rowId: string) {
    setColorRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const s = r.sizeInput.trim();
        if (!s || r.sizes.some((x) => x.size === s)) return { ...r, sizeInput: "" };
        return { ...r, sizes: [...r.sizes, { size: s, stock: 10 }], sizeInput: "" };
      }),
    );
  }

  function updateSizeStock(rowId: string, size: string, stock: number) {
    setColorRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, sizes: r.sizes.map((s) => (s.size === size ? { ...s, stock } : s)) }
          : r,
      ),
    );
  }

  function removeSizeFromColor(rowId: string, size: string) {
    setColorRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, sizes: r.sizes.filter((s) => s.size !== size) } : r,
      ),
    );
  }

  function copySizesFromFirst(targetId: string) {
    const first = colorRows.find((r) => r.id !== targetId);
    if (!first) return;
    setColorRows((prev) =>
      prev.map((r) =>
        r.id === targetId ? { ...r, sizes: first.sizes.map((s) => ({ ...s })) } : r,
      ),
    );
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Shoe name is required."); return; }
    if (colorRows.length === 0) { setError("Add at least one color."); return; }

    const priceNum = price.trim() === "" ? 0 : parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) { setError("Enter a valid price."); return; }

    setSubmitting(true);
    setError("");

    const input = {
      name: name.trim(),
      priceCents: Math.round(priceNum * 100),
      images: mainImages,
      colorImages: colorRows.map(({ name, hex, imageUrls, sizes }) => ({
        name,
        hex,
        imageUrls,
        sizes,
      })),
      isPublished,
      isFeatured,
      categoryId: categoryId || null,
    };

    startTransition(async () => {
      try {
        const result = initialData
          ? await updateProduct(initialData.id, input)
          : await createProduct(input);
        if (!result.success) { setError(result.error ?? "Something went wrong."); setSubmitting(false); return; }
        router.push("/admin/products");
        router.refresh();
      } catch {
        setError("Something went wrong.");
        setSubmitting(false);
      }
    });
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Name */}
      <Field label="Shoe Name *">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Flex Runner Pro" className={inp} />
      </Field>

      {/* Price */}
      <Field label="Base Price (DT)">
        <input type="number" min="0" step="0.001" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 89.900" className={inp} />
      </Field>

      {/* Category */}
      <Field label="Category">
        <div className="relative">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`${inp} appearance-none pr-8`}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {!c.isActive ? " (hidden)" : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
        </div>
      </Field>

      {/* Main Product Photos */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 space-y-3">
        <div>
          <p className="text-sm font-bold text-[var(--color-text)]">Main Product Photos</p>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Shown on product cards and as the default gallery before a color is selected. Add multiple photos.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              value={mainUrlInput}
              onChange={(e) => setMainUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMainUrl(); } }}
              placeholder="Paste image URL…"
              className={`${inp} py-2 pl-8 text-xs`}
            />
          </div>
          <button
            type="button"
            onClick={addMainUrl}
            disabled={!mainUrlInput.trim() || uploading}
            className="shrink-0 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold hover:bg-[var(--color-bg)] transition disabled:opacity-40"
          >
            Add
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={mainFileRef}
            onChange={handleMainFileUpload}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => mainFileRef.current?.click()}
            title="Upload from device"
            className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs font-semibold hover:bg-[var(--color-bg)] transition disabled:opacity-40"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            disabled={uploading || allUploadedImages.length === 0}
            onClick={() => setPickerTarget("main")}
            title="Choose from already uploaded images"
            className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs font-semibold hover:bg-[var(--color-bg)] transition disabled:opacity-40"
          >
            <Images className="h-3.5 w-3.5" />
          </button>
        </div>

        {mainImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mainImages.map((url, pi) => (
              <div key={pi} className="group relative h-16 w-16 overflow-hidden rounded-xl border border-[var(--color-border)]">
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3C/svg%3E";
                  }}
                />
                {pi === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-[var(--color-accent)] px-1 text-[8px] font-bold text-white">
                    Card
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setMainImages((prev) => prev.filter((_, i) => i !== pi))}
                  className="absolute right-0.5 top-0.5 hidden rounded-full bg-red-600 p-0.5 text-white group-hover:flex"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-[var(--color-text)]">Colors, Photos &amp; Sizes</p>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Each color has its own photos and size/stock table. Stock 0 = sold out.
          </p>
        </div>

        {colorRows.map((row, rowIndex) => (
          <div key={row.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-5 space-y-4">
            {/* Color name + hex */}
            <div className="flex items-center gap-3">
              <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-[var(--color-border)] shadow-sm hover:border-[var(--color-accent)] transition">
                <div className="h-full w-full" style={{ backgroundColor: row.hex }} />
                <input
                  type="color"
                  value={row.hex}
                  onChange={(e) => updateColor(row.id, { hex: e.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
              <input
                value={row.name}
                onChange={(e) => {
                  const n = e.target.value;
                  const detectedHex = nameToHex(n);
                  updateColor(row.id, { name: n, ...(detectedHex ? { hex: detectedHex } : {}) });
                }}
                placeholder="Color name (e.g. Noir, Camel, Bordeaux…)"
                className={`${inp} min-w-0 flex-1`}
              />
              <button
                type="button"
                onClick={() => setColorRows((prev) => prev.filter((r) => r.id !== row.id))}
                className="shrink-0 rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-red-50 hover:text-red-500 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Photos</p>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]" />
                  <input
                    value={row.urlInput}
                    onChange={(e) => updateColor(row.id, { urlInput: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColorUrl(row.id); } }}
                    placeholder="Paste image URL…"
                    className={`${inp} py-2 pl-8 text-xs`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addColorUrl(row.id)}
                  disabled={!row.urlInput.trim() || uploading}
                  className="shrink-0 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold hover:bg-[var(--color-bg)] transition disabled:opacity-40"
                >
                  Add
                </button>
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
                  title="Upload from device"
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs font-semibold hover:bg-[var(--color-bg)] transition disabled:opacity-40"
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  disabled={uploading || allUploadedImages.length === 0}
                  onClick={() => setPickerTarget(row.id)}
                  title="Choose from already uploaded images"
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs font-semibold hover:bg-[var(--color-bg)] transition disabled:opacity-40"
                >
                  <Images className="h-3.5 w-3.5" />
                </button>
              </div>
              {row.imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {row.imageUrls.map((url, pi) => (
                    <div key={pi} className="group relative h-16 w-16 overflow-hidden rounded-xl border border-[var(--color-border)]">
                      <img src={url} alt="" className="h-full w-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3C/svg%3E"; }}
                      />
                      {pi === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-[var(--color-accent)] px-1 text-[8px] font-bold text-white">Main</span>
                      )}
                      <button
                        type="button"
                        onClick={() => updateColor(row.id, { imageUrls: row.imageUrls.filter((_, i) => i !== pi) })}
                        className="absolute right-0.5 top-0.5 hidden rounded-full bg-red-600 p-0.5 text-white group-hover:flex"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-border)]" />

            {/* Sizes + stock for this color */}
            <div className="space-y-2">
              {rowIndex > 0 && (
                <button
                  type="button"
                  onClick={() => copySizesFromFirst(row.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
                >
                  <Copy className="h-3 w-3" />
                  Copy sizes from first color
                </button>
              )}
              <SizesEditor
                sizes={row.sizes}
                sizeInput={row.sizeInput}
                onSizeInputChange={(v) => updateColor(row.id, { sizeInput: v })}
                onAddSize={() => addSizeToColor(row.id)}
                onStockChange={(size, stock) => updateSizeStock(row.id, size, stock)}
                onRemoveSize={(size) => removeSizeFromColor(row.id, size)}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setColorRows((prev) => [...prev, { id: uid(), name: "", hex: "#888888", imageUrls: [], urlInput: "", sizes: [], sizeInput: "" }])}
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
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || uploading}
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

    {pickerTarget !== null && (
      <ImagePickerModal
        images={allUploadedImages}
        alreadySelected={pickerAlreadySelected}
        onConfirm={handlePickerConfirm}
        onClose={() => setPickerTarget(null)}
      />
    )}
    </>
  );
}
