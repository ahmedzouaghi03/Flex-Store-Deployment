"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Loader2, Play } from "lucide-react";
import type { StoreConfig, StoreColors } from "@/lib/store-config";
import { resetToDefault } from "@/actions/storeConfigActions";
import { HeroTextEditor } from "./HeroTextEditor";
import { VideoTextEditor, FooterCtaEditor } from "./VideoTextEditor";
import { ColorEditor } from "./ColorEditor";
import { DeliveryFeeEditor, DeliveryFeeMiniPreview } from "./DeliveryFeeEditor";
import { HeroPhotoUpload } from "./HeroPhotoUpload";
import { VideoUpload } from "./VideoUpload";
import { LogoUpload } from "./LogoUpload";
import { StorePreview } from "./StorePreview";

// ── Reset bar ──────────────────────────────────────────────────────────────

function ResetButton() {
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  function handleClick() {
    if (!confirmed) {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
      return;
    }
    startTransition(async () => {
      await resetToDefault();
      window.location.reload();
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
        confirmed
          ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-red-200 hover:text-red-600"
      }`}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
      {pending ? "Resetting…" : confirmed ? "Click again to confirm reset" : "Reset to Default"}
    </button>
  );
}

// ── Row layout: editor left, mini preview right ────────────────────────────

function EditRow({
  title,
  desc,
  editor,
  preview,
}: {
  title: string;
  desc: string;
  editor: React.ReactNode;
  preview: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      {/* editor card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-text)]">{title}</h2>
        <p className="mb-5 mt-0.5 text-sm text-[var(--color-muted)]">{desc}</p>
        {editor}
      </div>
      {/* mini preview */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">Preview</p>
        <div className="flex-1">{preview}</div>
      </div>
    </div>
  );
}

// ── Mini preview components ────────────────────────────────────────────────

function HeroMiniPreview({
  hero,
  colors,
  heroVersion = 0,
  photoCard,
}: {
  hero: StoreConfig["hero"];
  colors: StoreColors;
  heroVersion?: number;
  photoCard?: StoreConfig["photoCard"];
}) {
  const vars = {
    "--p-dark": colors["green-dark"],
    "--p-green": colors.green,
    "--p-mid": colors["green-mid"],
    "--p-bright": colors["green-bright"],
  } as React.CSSProperties;

  return (
    <div
      style={vars}
      className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm"
    >
      <div
        className="flex items-start gap-3 p-4"
        style={{ background: `linear-gradient(135deg, var(--p-dark) 0%, var(--p-green) 55%, var(--p-mid) 100%)` }}
      >
        {/* text */}
        <div className="flex-1 min-w-0">
          <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5">
            <span className="h-1 w-1 rounded-full animate-pulse" style={{ backgroundColor: colors["green-bright"] }} />
            <span className="text-white font-bold" style={{ fontSize: 7, letterSpacing: "0.15em" }}>
              {hero.badge}
            </span>
          </div>
          <div className="font-black leading-tight text-white" style={{ fontSize: 16 }}>
            {hero.line1}
            <br />
            <span style={{ color: "var(--p-bright)" }}>{hero.line2}</span>
            <br />
            {hero.line3}
          </div>
          <p className="mt-1.5 line-clamp-2 text-white/60" style={{ fontSize: 8, lineHeight: 1.5 }}>
            {hero.subtitle}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className="inline-flex items-center rounded-full bg-white font-bold"
              style={{ fontSize: 8, padding: "3px 8px", color: colors.green }}
            >
              {hero.cta1} →
            </span>
            <span
              className="inline-flex items-center rounded-full border border-white/30 bg-white/10 text-white"
              style={{ fontSize: 8, padding: "3px 8px" }}
            >
              ▶ {hero.cta2}
            </span>
          </div>
        </div>
        {/* photo slot — key+src use heroVersion to reload after upload */}
        <div
          className="relative shrink-0 overflow-hidden rounded-xl border border-white/15"
          style={{ width: 64, aspectRatio: "4/5" }}
        >
          <img
            key={heroVersion}
            src={heroVersion > 0 ? `/hero-photo.jpg?v=${heroVersion}` : "/hero-photo.jpg"}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = "0";
            }}
          />
          {photoCard && (
            <div className="absolute bottom-1 left-1 rounded-md border border-white/20 bg-black/40 px-1.5 py-1 backdrop-blur-sm">
              <p className="text-white/60 leading-none" style={{ fontSize: 5 }}>{photoCard.label}</p>
              <p className="font-black text-white leading-none" style={{ fontSize: 7 }}>{photoCard.year}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



function VideoMiniPreview({ video, colors }: { video: StoreConfig["video"]; colors: StoreColors }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm">
      <div className="p-4">
        <p className="font-bold uppercase tracking-widest" style={{ fontSize: 8, color: colors.accent }}>
          {video.label}
        </p>
        <p className="mt-0.5 font-bold leading-tight text-[var(--color-text)]" style={{ fontSize: 13 }}>
          {video.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[var(--color-muted)]" style={{ fontSize: 8, lineHeight: 1.4 }}>
          {video.desc}
        </p>
      </div>
      <div
        className="mx-4 mb-4 flex items-center justify-center rounded-xl"
        style={{
          aspectRatio: "16/9",
          background: `linear-gradient(135deg, ${colors["green-dark"]}, ${colors.green})`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/25">
          <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
        </div>
      </div>
    </div>
  );
}

function FooterMiniPreview({ footerCta, colors }: { footerCta: StoreConfig["footerCta"]; colors: StoreColors }) {
  return (
    <div
      className="overflow-hidden rounded-2xl p-5 text-center shadow-sm"
      style={{ background: `linear-gradient(135deg, ${colors["green-dark"]}, ${colors.green})` }}
    >
      <p className="font-black leading-tight text-white" style={{ fontSize: 14 }}>
        {footerCta.title}
      </p>
      <p className="mt-1 line-clamp-2 text-white/60" style={{ fontSize: 8, lineHeight: 1.4 }}>
        {footerCta.desc}
      </p>
      <span
        className="mt-3 inline-block rounded-full font-bold"
        style={{
          fontSize: 9,
          padding: "5px 14px",
          backgroundColor: colors["green-bright"],
          color: colors["green-dark"],
        }}
      >
        {footerCta.btn} →
      </span>
    </div>
  );
}

function ColorMiniPreview({ colors }: { colors: StoreColors }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm">
      {/* gradient strip */}
      <div
        className="h-16"
        style={{ background: `linear-gradient(135deg, ${colors["green-dark"]}, ${colors.green}, ${colors["green-mid"]}, ${colors["green-bright"]})` }}
      />
      {/* sample UI elements */}
      <div className="space-y-2 bg-white p-3">
        <div className="flex gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: colors.accent }}>
            Button
          </span>
          <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: colors.accent, color: colors.accent }}>
            Outline
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(colors) as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: v }} />
              <span className="text-[9px] text-gray-400">{k}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogoMiniPreview({ version }: { version: number }) {
  const src = version > 0 ? `/store-logo.png?v=${version}` : "/store-logo.png";
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
        <p className="text-xs font-semibold text-[var(--color-muted)]">Navbar preview</p>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <img
          key={version}
          src={src}
          alt="Logo"
          className="h-8 object-contain"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = "none";
            (el.nextElementSibling as HTMLElement | null)?.removeAttribute("hidden");
          }}
        />
        <span hidden className="rounded-lg bg-[var(--color-green)] px-2 py-0.5 text-xs font-black text-white">
          FLEX
        </span>
        <div className="flex gap-3">
          <span className="text-xs text-[var(--color-muted)]">Home</span>
          <span className="text-xs text-[var(--color-muted)]">Shop</span>
        </div>
      </div>
    </div>
  );
}

function HeroPhotoMiniPreviewWithVersion({ version }: { version: number }) {
  const src = version > 0 ? `/hero-photo.jpg?v=${version}` : "/hero-photo.jpg";
  const [failed, setFailed] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm bg-[var(--color-bg)]">
      <div className="flex items-center justify-center" style={{ aspectRatio: "4/5", maxHeight: 220 }}>
        {failed ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-[var(--color-muted)]">
            <span className="text-3xl opacity-30">🖼️</span>
            <p className="text-xs">No photo yet</p>
          </div>
        ) : (
          <img key={version} src={src} alt="Hero" className="h-full w-full object-cover" onError={() => setFailed(true)} />
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function StoreSettingsClient({ config, hasVideo }: { config: StoreConfig; hasVideo: boolean }) {
  const [heroPreview, setHeroPreview]         = useState(config.hero);
  const [photoCardPreview, setPhotoCardPreview] = useState(config.photoCard);
  const [videoPreview, setVideoPreview]       = useState(config.video);
  const [footerPreview, setFooterPreview]     = useState(config.footerCta);
  const [colorPreview, setColorPreview]       = useState<StoreColors>(config.colors);
  const [deliveryFeePreview, setDeliveryFeePreview] = useState(config.deliveryFeeCents);
  const [logoVersion, setLogoVersion]         = useState(0);
  const [heroVersion, setHeroVersion]         = useState(0);

  return (
    <div className="space-y-8">
      {/* reset bar */}
      <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">Reset store content</p>
          <p className="text-xs text-[var(--color-muted)]">
            Restores all text and colors to their original defaults. Photos and videos are kept.
          </p>
        </div>
        <ResetButton />
      </div>

      {/* Logo */}
      <EditRow
        title="🖼️ Store Logo"
        desc="Shown in the navbar and admin header. Replaces the FLEX text."
        editor={<LogoUpload onUploaded={setLogoVersion} />}
        preview={<LogoMiniPreview version={logoVersion} />}
      />

      {/* Hero text */}
      <EditRow
        title="🎯 Hero Section — Text"
        desc="The main banner at the top of your homepage."
        editor={<HeroTextEditor initial={config.hero} onPreviewChange={setHeroPreview} />}
        preview={<HeroMiniPreview hero={heroPreview} colors={colorPreview} heroVersion={heroVersion} />}
      />

      {/* Hero photo — preview reuses HeroMiniPreview so photo updates appear there */}
      <EditRow
        title="🖼️ Hero Section — Photo"
        desc="The commercial photo on the right of the hero banner. Updates the hero preview above."
        editor={
          <HeroPhotoUpload
            onUploaded={setHeroVersion}
            initialPhotoCard={config.photoCard}
            onPhotoCardChange={setPhotoCardPreview}
          />
        }
        preview={<HeroMiniPreview hero={heroPreview} colors={colorPreview} heroVersion={heroVersion} photoCard={photoCardPreview} />}
      />

      {/* Video text */}
      <EditRow
        title="🎬 Video Section — Text"
        desc='Labels and description for the "Our Story" section.'
        editor={<VideoTextEditor initial={config.video} onPreviewChange={setVideoPreview} />}
        preview={<VideoMiniPreview video={videoPreview} colors={colorPreview} />}
      />

      {/* Video file */}
      <EditRow
        title="🎬 Video Section — File"
        desc="Upload your brand video. Replaces the placeholder on the homepage."
        editor={<VideoUpload hasVideo={hasVideo} />}
        preview={<VideoMiniPreview video={videoPreview} colors={colorPreview} />}
      />

      {/* Footer CTA */}
      <EditRow
        title="📢 Footer Call-to-Action"
        desc="The green banner at the very bottom of the homepage."
        editor={<FooterCtaEditor initial={config.footerCta} onPreviewChange={setFooterPreview} />}
        preview={<FooterMiniPreview footerCta={footerPreview} colors={colorPreview} />}
      />

      {/* Colors */}
      <EditRow
        title="🎨 Brand Colors"
        desc="Pick colors for the entire site. The preview updates instantly."
        editor={<ColorEditor initial={config.colors} onPreviewChange={setColorPreview} />}
        preview={<ColorMiniPreview colors={colorPreview} />}
      />

      {/* Delivery fee */}
      <EditRow
        title="🚚 Delivery Fee"
        desc="Flat fee added to every order's total at checkout."
        editor={<DeliveryFeeEditor initialCents={config.deliveryFeeCents} onPreviewChange={setDeliveryFeePreview} />}
        preview={<DeliveryFeeMiniPreview cents={deliveryFeePreview} />}
      />

      {/* ── Full-page scrollable preview ── */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
            Full Page Preview
          </p>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>
        <p className="mb-4 text-center text-xs text-[var(--color-muted)]">
          Scroll inside the preview to see the complete homepage with all your changes.
        </p>

        {/* browser shell */}
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-lg">
          {/* chrome bar */}
          <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <div className="ml-3 flex flex-1 items-center rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5">
              <span className="text-xs text-[var(--color-muted)]">flexcomfortshoes.com</span>
            </div>
            <span className="ml-3 rounded-full bg-[var(--color-accent)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-accent)]">
              Live Preview
            </span>
          </div>

          {/* scrollable page content — no max-height cap so user can scroll freely */}
          <div className="overflow-y-auto" style={{ maxHeight: "80vh" }}>
            <StorePreview
              hero={heroPreview}
              video={videoPreview}
              footerCta={footerPreview}
              colors={colorPreview}
              usp={config.usp}
              logoVersion={logoVersion}
              heroVersion={heroVersion}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
