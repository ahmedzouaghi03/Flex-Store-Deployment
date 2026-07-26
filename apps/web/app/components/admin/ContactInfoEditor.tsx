"use client";

import { useState, useTransition } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { saveContactInfo } from "@/actions/storeConfigActions";
import type { ContactInfo } from "@/types";
import { Field, SaveButton, inp } from "./HeroTextEditor";

export function ContactInfoEditor({
  initial,
  onPreviewChange,
}: {
  initial: ContactInfo;
  onPreviewChange?: (info: ContactInfo) => void;
}) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof ContactInfo, value: string) {
    const next = { ...form, [key]: value };
    setForm(next);
    setSaved(false);
    onPreviewChange?.(next);
  }

  function handleSave() {
    setError("");
    if (!form.email.trim() || !form.phone.trim() || !form.location.trim()) {
      setError("Email, phone, and location are required");
      return;
    }
    startTransition(async () => {
      const res = await saveContactInfo({
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        responseTime: form.responseTime.trim() || "Within 24 hours",
      });
      if (res.success) setSaved(true);
      else setError(res.error ?? "Failed to save");
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="contact@flexshoes.tn"
            className={inp}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+216 XX XXX XXX"
            className={inp}
          />
        </Field>
        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Tunisia"
            className={inp}
          />
        </Field>
        <Field label="Response time">
          <input
            value={form.responseTime}
            onChange={(e) => set("responseTime", e.target.value)}
            placeholder="Within 24 hours"
            className={inp}
          />
        </Field>
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        Shown on the public Contact page. Email and phone become clickable links.
      </p>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <SaveButton pending={pending} saved={saved} onClick={handleSave} />
    </div>
  );
}

export function ContactInfoMiniPreview({ info }: { info: ContactInfo }) {
  const rows = [
    { icon: Mail, label: "Email", value: info.email || "—" },
    { icon: Phone, label: "Phone", value: info.phone || "—" },
    { icon: MapPin, label: "Location", value: info.location || "—" },
    { icon: Clock, label: "Response", value: info.responseTime || "—" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <div className="space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
              <Icon className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
              <p className="truncate text-xs font-semibold text-[var(--color-text)]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
