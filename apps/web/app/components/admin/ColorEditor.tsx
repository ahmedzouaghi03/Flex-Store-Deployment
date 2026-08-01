"use client";

import { useState, useTransition } from "react";
import { saveColorSettings } from "@/actions/storeSettingsActions";
import type { StoreColors } from "@/lib/store-config";
import { SaveButton } from "./HeroTextEditor";
import { ChevronDown, ChevronUp, Wand2 } from "lucide-react";

// ── Color math ─────────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  function hue(p: number, q: number, t: number) {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  let r, g, b;
  if (sn === 0) { r = g = b = ln; }
  else {
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    r = hue(p, q, hn + 1/3);
    g = hue(p, q, hn);
    b = hue(p, q, hn - 1/3);
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function generatePalette(baseHex: string): StoreColors {
  const [h, s, l] = hexToHsl(baseHex);
  return {
    accent:          baseHex,
    "green-dark":    hslToHex(h, clamp(s + 5, 0, 100), clamp(Math.round(l * 0.40), 4, 25)),
    green:           baseHex,
    "green-mid":     hslToHex(h, s,                    clamp(Math.round(l * 1.25), l + 1, 70)),
    "green-light":   hslToHex(h, clamp(s - 5, 0, 100), clamp(Math.round(l * 1.65), l + 5, 78)),
    "green-bright":  hslToHex(h, clamp(s - 8, 0, 100), clamp(Math.round(l * 2.10), l + 10, 85)),
  };
}

// ── Preset themes ──────────────────────────────────────────────────────────

const PRESETS: { name: string; base: string }[] = [
  { name: "Forest",   base: "#4a7018" },
  { name: "Ocean",    base: "#1a5276" },
  { name: "Purple",   base: "#6c3483" },
  { name: "Crimson",  base: "#922b21" },
  { name: "Amber",    base: "#9a6e0a" },
  { name: "Teal",     base: "#0e8c6e" },
  { name: "Rose",     base: "#943166" },
  { name: "Midnight", base: "#1a2a6c" },
];

// ── Manual color rows ──────────────────────────────────────────────────────

const COLOR_LABELS: { key: keyof StoreColors; label: string; hint: string }[] = [
  { key: "accent",       label: "Accent / CTA",   hint: "Buttons, active links, badges" },
  { key: "green-dark",   label: "Dark shade",     hint: "Hero gradient start, footer background" },
  { key: "green",        label: "Main shade",     hint: "Sidebar links, logo badge" },
  { key: "green-mid",    label: "Mid shade",      hint: "Hero gradient middle, button hover" },
  { key: "green-light",  label: "Light shade",    hint: "Hero glow, USP background" },
  { key: "green-bright", label: "Bright shade",   hint: "Headline accent, CTA badge" },
];

// ── Component ──────────────────────────────────────────────────────────────

export function ColorEditor({
  initial,
  onPreviewChange,
}: {
  initial: StoreColors;
  onPreviewChange?: (v: StoreColors) => void;
}) {
  const [colors, setColors]     = useState(initial);
  const [base, setBase]         = useState(initial.accent);
  const [advanced, setAdvanced] = useState(false);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  function applyPalette(palette: StoreColors, newBase: string) {
    setColors(palette);
    setBase(newBase);
    setSaved(false);
    onPreviewChange?.(palette);
  }

  function handleBaseChange(hex: string) {
    const palette = generatePalette(hex);
    applyPalette(palette, hex);
  }

  function handlePreset(base: string) {
    const palette = generatePalette(base);
    applyPalette(palette, base);
  }

  function handleManual(key: keyof StoreColors, value: string) {
    const next = { ...colors, [key]: value };
    setColors(next);
    setSaved(false);
    onPreviewChange?.(next);
  }

  function handleSave() {
    setError("");
    startTransition(async () => {
      const res = await saveColorSettings({
        colorAccent: colors.accent,
        colorGreenDark: colors["green-dark"],
        colorGreen: colors.green,
        colorGreenMid: colors["green-mid"],
        colorGreenLight: colors["green-light"],
        colorGreenBright: colors["green-bright"],
      });
      if (res.success) setSaved(true);
      else setError(res.error ?? "Failed to save");
    });
  }

  const scale: (keyof StoreColors)[] = ["green-dark", "green", "green-mid", "green-light", "green-bright", "accent"];

  return (
    <div className="space-y-5">

      {/* ── Preset themes ── */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
          Theme presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const palette = generatePalette(p.base);
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePreset(p.base)}
                title={p.name}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 transition hover:border-[var(--color-accent)] hover:shadow-sm"
              >
                {/* mini scale strip */}
                <div className="flex h-4 w-16 overflow-hidden rounded-full border border-black/10">
                  {(["green-dark","green","green-mid","green-light","green-bright"] as (keyof StoreColors)[]).map((k) => (
                    <div key={k} className="flex-1" style={{ backgroundColor: palette[k] }} />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-[var(--color-muted)] group-hover:text-[var(--color-text)]">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Base color picker ── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
          Pick your base color — palette auto-generates
        </p>
        <div className="flex items-center gap-4">
          {/* big swatch + hidden input */}
          <label className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-[var(--color-border)] shadow-sm transition hover:border-[var(--color-accent)]">
            <div className="h-full w-full" style={{ backgroundColor: base }} />
            <input
              type="color"
              value={base}
              onChange={(e) => handleBaseChange(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>

          <div className="flex-1 space-y-1.5">
            {/* generated scale preview */}
            <div className="flex h-7 overflow-hidden rounded-lg border border-[var(--color-border)]">
              {scale.map((k) => (
                <div
                  key={k}
                  className="flex-1"
                  style={{ backgroundColor: colors[k] }}
                  title={k}
                />
              ))}
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              <Wand2 className="mr-1 inline h-3 w-3" />
              All 6 shades auto-generated from this color
            </p>
          </div>

          <code className="shrink-0 rounded-lg bg-[var(--color-bg)] px-2 py-1.5 text-xs text-[var(--color-muted)]">
            {base}
          </code>
        </div>
      </div>

      {/* ── Advanced toggle ── */}
      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
      >
        <span>Advanced — tweak each shade individually</span>
        {advanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {advanced && (
        <div className="grid gap-3 sm:grid-cols-2">
          {COLOR_LABELS.map(({ key, label, hint }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white p-3 transition hover:border-[var(--color-accent)]"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] shadow-sm">
                <div className="h-full w-full" style={{ backgroundColor: colors[key] }} />
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => handleManual(key, e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
                <p className="truncate text-xs text-[var(--color-muted)]">{hint}</p>
              </div>
              <code className="shrink-0 rounded-lg bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-muted)]">
                {colors[key]}
              </code>
            </label>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <SaveButton pending={pending} saved={saved} onClick={handleSave} />
    </div>
  );
}
