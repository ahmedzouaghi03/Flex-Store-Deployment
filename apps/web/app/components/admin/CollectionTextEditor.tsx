"use client";

import { useState, useTransition } from "react";
import { saveCollectionSettings } from "@/actions/storeSettingsActions";
import type { CollectionText } from "@/types";
import { Field, SaveButton, inp } from "./HeroTextEditor";

export function CollectionTextEditor({
  initial,
  onPreviewChange,
}: {
  initial: CollectionText;
  onPreviewChange?: (v: CollectionText) => void;
}) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, value: string) {
    const next = { ...form, [key]: value };
    setForm(next);
    setSaved(false);
    onPreviewChange?.(next);
  }

  function handleSave() {
    setError("");
    startTransition(async () => {
      const res = await saveCollectionSettings({
        collectionLabel: form.label,
        collectionTitle: form.title,
        collectionDesc: form.desc,
      });
      if (res.success) setSaved(true);
      else setError(res.error ?? "Failed to save");
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Section label">
          <input value={form.label} onChange={(e) => set("label", e.target.value)} className={inp} />
        </Field>
        <Field label="Title">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inp} />
        </Field>
      </div>
      <Field label="Description">
        <textarea rows={2} value={form.desc} onChange={(e) => set("desc", e.target.value)} className={inp} />
      </Field>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <SaveButton pending={pending} saved={saved} onClick={handleSave} />
    </div>
  );
}
