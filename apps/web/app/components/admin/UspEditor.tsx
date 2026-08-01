"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { saveUsps } from "@/actions/storeSettingsActions";
import type { UspItem } from "@/types";
import { SaveButton, inp } from "./HeroTextEditor";

export function UspEditor({
  initial,
  onPreviewChange,
}: {
  initial: UspItem[];
  onPreviewChange?: (v: UspItem[]) => void;
}) {
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(next: UspItem[]) {
    setItems(next);
    setSaved(false);
    onPreviewChange?.(next);
  }

  function set(index: number, key: keyof UspItem, value: string) {
    update(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function addItem() {
    update([...items, { label: "New feature", desc: "Description" }]);
  }

  function removeItem(index: number) {
    update(items.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  }

  function handleSave() {
    setError("");
    startTransition(async () => {
      const res = await saveUsps(items.map((item, order) => ({ ...item, order })));
      if (res.success) setSaved(true);
      else setError(res.error ?? "Failed to save");
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 rounded-xl border border-[var(--color-border)] bg-white p-3">
          <div className="flex flex-col gap-1 pt-1.5">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
            >
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <input
              value={item.label}
              onChange={(e) => set(i, "label", e.target.value)}
              placeholder="Label"
              className={inp}
            />
            <input
              value={item.desc}
              onChange={(e) => set(i, "desc", e.target.value)}
              placeholder="Description"
              className={inp}
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="mt-1.5 shrink-0 text-red-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        <Plus size={14} /> Add USP
      </button>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <SaveButton pending={pending} saved={saved} onClick={handleSave} />
    </div>
  );
}
