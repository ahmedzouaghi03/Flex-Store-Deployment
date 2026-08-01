"use client";

import { useState, useTransition } from "react";
import { saveVideoSettings, saveFooterSettings } from "@/actions/storeSettingsActions";
import type { VideoText, FooterCtaText } from "@/types";
import { Field, SaveButton, inp } from "./HeroTextEditor";

export function VideoTextEditor({
  initial,
  onPreviewChange,
}: {
  initial: VideoText;
  onPreviewChange?: (v: VideoText) => void;
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
      const res = await saveVideoSettings({
        videoSectionLabel: form.label,
        videoSectionTitle: form.title,
        videoSectionDesc: form.desc,
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

export function FooterCtaEditor({
  initial,
  onPreviewChange,
}: {
  initial: FooterCtaText;
  onPreviewChange?: (v: FooterCtaText) => void;
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
      const res = await saveFooterSettings({
        footerCtaTitle: form.title,
        footerCtaDesc: form.desc,
        footerCtaBtn: form.btn,
      });
      if (res.success) setSaved(true);
      else setError(res.error ?? "Failed to save");
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inp} />
        </Field>
        <Field label="Button text">
          <input value={form.btn} onChange={(e) => set("btn", e.target.value)} className={inp} />
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
