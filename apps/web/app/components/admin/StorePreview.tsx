"use client";

import type { StoreConfig, StoreColors } from "@/lib/store-config";

type Props = {
  hero: StoreConfig["hero"];
  video: StoreConfig["video"];
  footerCta: StoreConfig["footerCta"];
  usp: StoreConfig["usp"];
  colors: StoreColors;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
};

export function StorePreview({ hero, video, footerCta, usp, colors, logoUrl, heroImageUrl }: Props) {
  // scoped CSS variables so they don't bleed into the admin UI
  const vars = {
    "--p-dark":   colors["green-dark"],
    "--p-green":  colors.green,
    "--p-mid":    colors["green-mid"],
    "--p-light":  colors["green-light"],
    "--p-bright": colors["green-bright"],
    "--p-accent": colors.accent,
  } as React.CSSProperties;

  return (
    <div style={vars} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-md">

      {/* browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="ml-2 flex-1 rounded-full bg-white border border-[var(--color-border)] px-3 py-0.5 text-[10px] text-[var(--color-muted)]">
          flexcomfortshoes.com
        </div>
        <span className="text-[10px] font-semibold text-[var(--color-muted)]">Live Preview</span>
      </div>

      {/* scrollable store content */}
      <div className="overflow-y-auto" style={{ maxHeight: "72vh" }}>

        {/* ── mini navbar ── */}
        <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-2">
          <div className="flex items-center gap-1.5">
            {logoUrl ? (
              <img key={logoUrl} src={logoUrl} alt="logo" className="h-5 object-contain" />
            ) : (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-black text-white"
                style={{ backgroundColor: "var(--p-green)" }}
              >
                FLEX
              </span>
            )}
            <span className="text-[9px] text-gray-500">Comfort Shoes</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[9px] text-gray-400">Home</span>
            <span className="text-[9px] text-gray-400">Shop</span>
          </div>
        </div>

        {/* ── mini hero ── */}
        <div
          className="px-5 py-6"
          style={{
            background: `linear-gradient(135deg, var(--p-dark) 0%, var(--p-green) 55%, var(--p-mid) 100%)`,
          }}
        >
          <div className="flex items-start gap-4">
            {/* left text */}
            <div className="flex-1">
              <div
                className="mb-2 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5"
                style={{ fontSize: 8 }}
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: "var(--p-bright)" }}
                />
                <span className="font-bold uppercase tracking-widest text-white">{hero.badge}</span>
              </div>

              <div className="font-black leading-tight text-white" style={{ fontSize: 18 }}>
                {hero.line1}
                <br />
                <span style={{ color: "var(--p-bright)" }}>{hero.line2}</span>
                <br />
                {hero.line3}
              </div>

              <p className="mt-1.5 line-clamp-2 leading-relaxed text-white/60" style={{ fontSize: 8 }}>
                {hero.subtitle}
              </p>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span
                  className="inline-flex items-center gap-0.5 rounded-full bg-white font-bold"
                  style={{ fontSize: 8, padding: "3px 8px", color: "var(--p-green)" }}
                >
                  {hero.cta1} →
                </span>
                <span
                  className="inline-flex items-center gap-0.5 rounded-full border border-white/30 bg-white/10 text-white"
                  style={{ fontSize: 8, padding: "3px 8px" }}
                >
                  ▶ {hero.cta2}
                </span>
              </div>
            </div>

            {/* right: hero photo */}
            <div
              className="shrink-0 overflow-hidden rounded-xl border border-white/15"
              style={{ width: 72, aspectRatio: "4/5", background: heroImageUrl ? undefined : "rgba(255,255,255,0.1)" }}
            >
              {heroImageUrl && (
                <img key={heroImageUrl} src={heroImageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          </div>
        </div>

        {/* ── mini USP bar ── */}
        <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 bg-white">
          {usp.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 px-1 py-2.5 text-center">
              <div
                className="mb-1 flex h-5 w-5 items-center justify-center rounded-lg"
                style={{ backgroundColor: colors["green-dark"] + "20" }}
              >
                <span style={{ fontSize: 9, color: "var(--p-accent)" }}>✦</span>
              </div>
              <p className="font-semibold text-gray-800" style={{ fontSize: 8 }}>{item.label}</p>
              <p className="leading-tight text-gray-400" style={{ fontSize: 7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ── mini video section ── */}
        <div className="bg-gray-50 px-5 py-5">
          <div className="mb-3 text-center">
            <p className="font-bold uppercase tracking-widest" style={{ fontSize: 8, color: "var(--p-accent)" }}>
              {video.label}
            </p>
            <p className="mt-0.5 font-bold leading-tight text-gray-800" style={{ fontSize: 12 }}>
              {video.title}
            </p>
            <p className="mt-0.5 line-clamp-1 text-gray-400" style={{ fontSize: 8 }}>
              {video.desc}
            </p>
          </div>
          <div
            className="flex aspect-video w-full items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(135deg, var(--p-dark), var(--p-green))` }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/25">
              <span className="ml-0.5 text-white" style={{ fontSize: 10 }}>▶</span>
            </div>
          </div>
        </div>

        {/* ── mini products placeholder ── */}
        <div className="bg-white px-5 py-5">
          <div className="mb-3">
            <p className="font-bold uppercase tracking-widest" style={{ fontSize: 8, color: "var(--p-accent)" }}>
              Collection
            </p>
            <p className="font-bold text-gray-800" style={{ fontSize: 12 }}>Featured Shoes</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-100">
                <div className="aspect-square bg-gray-100" />
                <div className="p-1.5">
                  <div className="h-1.5 w-3/4 rounded bg-gray-200" />
                  <div className="mt-1 h-1.5 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── mini footer CTA ── */}
        <div
          className="px-5 py-6 text-center"
          style={{ background: `linear-gradient(135deg, var(--p-dark), var(--p-green))` }}
        >
          <p className="font-black leading-tight text-white" style={{ fontSize: 14 }}>
            {footerCta.title}
          </p>
          <p className="mt-1 line-clamp-1 text-white/60" style={{ fontSize: 8 }}>
            {footerCta.desc}
          </p>
          <span
            className="mt-2.5 inline-block rounded-full font-bold"
            style={{
              fontSize: 9,
              padding: "5px 14px",
              backgroundColor: "var(--p-bright)",
              color: "var(--p-dark)",
            }}
          >
            {footerCta.btn} →
          </span>
        </div>

      </div>
    </div>
  );
}
