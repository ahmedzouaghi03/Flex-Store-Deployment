"use client";

import { useState, useTransition } from "react";
import { Plus, X, Pencil, Trash2, Loader2, Upload, ImageOff } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from "@/actions/categoryActions";
import type { AdminCategory, CategoryInput } from "@/types";
import { ConfirmDialog } from "./ConfirmDialog";

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

async function uploadToImgbb(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload-image", { method: "POST", body: fd });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!json.url) throw new Error(json.error ?? "Upload failed");
  return json.url;
}

// ── Add / edit form ─────────────────────────────────────────────────────────
function CategoryForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: AdminCategory;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [, start] = useTransition();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadToImgbb(file);
      setImage(url);
    } catch {
      setError("Image upload failed. Check IMGBB_API_KEY in .env.local");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setLoading(true);
    setError("");

    const input: CategoryInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      isActive,
    };

    start(async () => {
      const res = initial ? await updateCategory(initial.id, input) : await createCategory(input);
      if (!res.success) {
        setError(res.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      onDone();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--color-text)]">
          {initial ? "Edit Category" : "Add Category"}
        </p>
        <button type="button" onClick={onCancel} className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-semibold text-[var(--color-muted)]">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Running Shoes" className={inp} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-semibold text-[var(--color-muted)]">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description shown on the category page"
            rows={2}
            className={inp}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-semibold text-[var(--color-muted)]">Image (optional)</label>
          <div className="flex items-center gap-3">
            {image ? (
              <div className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage("")}
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
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Paste image URL…"
                className={`${inp} min-w-0 py-2 text-xs`}
              />
              <input type="file" accept="image/*" className="hidden" id="category-image-upload" onChange={handleFileUpload} />
              <label
                htmlFor="category-image-upload"
                title="Upload from device"
                className="shrink-0 inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs font-semibold hover:bg-[var(--color-bg)] transition"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              </label>
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded accent-[var(--color-accent)]" />
            <span className="text-sm font-medium text-[var(--color-text)]">Active — visible to store visitors</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading || uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Save Changes" : "Add Category"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Category card ────────────────────────────────────────────────────────────
function CategoryCard({ category, onEdit }: { category: AdminCategory; onEdit: () => void }) {
  const [, start] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleToggleActive() {
    setLoading(true);
    setError("");
    start(async () => {
      const res = await toggleCategoryActive(category.id, !category.isActive);
      if (!res.success) setError(res.error ?? "Failed.");
      setLoading(false);
    });
  }

  function handleDelete() {
    setConfirmOpen(false);
    setLoading(true);
    setError("");
    start(async () => {
      const res = await deleteCategory(category.id);
      if (!res.success) {
        setError(res.error ?? "Failed.");
        setLoading(false);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4">
      {category.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={category.image} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-[var(--color-border)] object-cover" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-muted)]">
          <ImageOff className="h-5 w-5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-[var(--color-text)] truncate">{category.name}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              category.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {category.isActive ? "Active" : "Hidden"}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--color-muted)] truncate">/{category.slug}</p>
        <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">
          {category.productCount} product{category.productCount === 1 ? "" : "s"}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleToggleActive}
          disabled={loading}
          title={category.isActive ? "Hide from store" : "Show in store"}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : category.isActive ? "Hide" : "Show"}
        </button>
        <button
          onClick={onEdit}
          title="Edit category"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[var(--color-muted)] hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)] transition"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
          title="Delete category"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[var(--color-muted)] hover:border-red-200 hover:text-red-500 transition disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          title="Delete this category?"
          message={
            category.productCount > 0
              ? `"${category.name}" will be removed. ${category.productCount} product${category.productCount === 1 ? "" : "s"} using it will become uncategorized, not deleted.`
              : `"${category.name}" will be permanently removed.`
          }
          confirmLabel="Delete"
          isPending={loading}
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function CategoriesClient({ categories }: { categories: AdminCategory[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingCategory = categories.find((c) => c.id === editingId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-muted)]">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>
        {!showAddForm && !editingId && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        )}
      </div>

      {showAddForm && <CategoryForm onDone={() => setShowAddForm(false)} onCancel={() => setShowAddForm(false)} />}

      <div className="space-y-2">
        {categories.map((category) =>
          editingCategory?.id === category.id ? (
            <CategoryForm
              key={category.id}
              initial={category}
              onDone={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <CategoryCard key={category.id} category={category} onEdit={() => setEditingId(category.id)} />
          ),
        )}
      </div>

      {categories.length === 0 && !showAddForm && (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
          <p className="text-sm text-[var(--color-muted)]">No categories yet.</p>
        </div>
      )}
    </div>
  );
}
