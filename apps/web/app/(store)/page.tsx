import Link from "next/link";
import { headers } from "next/headers";
import { ArrowRight, Play, Feather, Leaf, Zap, Star } from "lucide-react";

import { getFeaturedProducts } from "@/actions/productActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { HeroImage } from "@/components/store/HeroImage";
import { AutoPlayVideo } from "@/components/store/AutoPlayVideo";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { DEFAULT_HERO, DEFAULT_VIDEO, DEFAULT_FOOTER_CTA, DEFAULT_COLLECTION, DEFAULT_USPS } from "@/types";
import { Reveal } from "@/components/store/Reveal";
import { subdomainHref } from "@/lib/subdomain";

const USP_ICONS = [Feather, Leaf, Zap, Star];

export default async function HomePage() {
  const [featured, settingsResult, host] = await Promise.all([
    getFeaturedProducts(),
    getStoreSettings(),
    headers().then((h) => h.get("host") ?? ""),
  ]);
  const products = featured.success ? (featured.data ?? []) : [];
  const settings = settingsResult.success ? settingsResult.data : null;
  const shopHref = subdomainHref("/shop", "shop", host);
  const shopHrefBase = subdomainHref("", "shop", host);

  const hero = {
    badge: settings?.heroBadge ?? DEFAULT_HERO.badge,
    line1: settings?.heroLine1 ?? DEFAULT_HERO.line1,
    line2: settings?.heroLine2 ?? DEFAULT_HERO.line2,
    line3: settings?.heroLine3 ?? DEFAULT_HERO.line3,
    subtitle: settings?.heroSubtitle ?? DEFAULT_HERO.subtitle,
    cta1: settings?.heroCta1 ?? DEFAULT_HERO.cta1,
    cta2: settings?.heroCta2 ?? DEFAULT_HERO.cta2,
  };

  const video = {
    label: settings?.videoSectionLabel ?? DEFAULT_VIDEO.label,
    title: settings?.videoSectionTitle ?? DEFAULT_VIDEO.title,
    desc: settings?.videoSectionDesc ?? DEFAULT_VIDEO.desc,
  };

  const footerCta = {
    title: settings?.footerCtaTitle ?? DEFAULT_FOOTER_CTA.title,
    desc: settings?.footerCtaDesc ?? DEFAULT_FOOTER_CTA.desc,
    btn: settings?.footerCtaBtn ?? DEFAULT_FOOTER_CTA.btn,
  };

  const collection = {
    label: settings?.collectionLabel ?? DEFAULT_COLLECTION.label,
    title: settings?.collectionTitle ?? DEFAULT_COLLECTION.title,
    desc: settings?.collectionDesc ?? DEFAULT_COLLECTION.desc,
  };

  const usp =
    settings && settings.usps.length > 0
      ? settings.usps.map((u) => ({ label: u.label, desc: u.desc }))
      : DEFAULT_USPS;

  const overlayCard = {
    label: settings?.heroOverlayCardLabel ?? "Collection",
    year: settings?.heroOverlayCardYear ?? "2025",
    collection: settings?.heroOverlayCardCollection ?? "",
  };

  const videoUrl = settings?.videoUrl ?? null;
  const hasVideo = videoUrl !== null;

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[var(--color-green-dark)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-green-dark)] via-[var(--color-green)] to-[var(--color-green-mid)]" />
          <div className="absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full bg-[var(--color-green-light)] opacity-20 blur-[120px]" />
          <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-[var(--color-green-bright)] opacity-10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

            {/* LEFT: text */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-white backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-green-bright)]" />
                {hero.badge}
              </span>
              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
                {hero.line1}
                <br />
                <span className="text-[var(--color-green-bright)] drop-shadow-[0_0_40px_rgba(158,212,58,0.4)]">
                  {hero.line2}
                </span>
                <br />
                {hero.line3}
              </h1>
              <p className="mt-6 max-w-md text-base text-white/65 md:text-lg">
                {hero.subtitle}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href={shopHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[var(--color-green)] shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition hover:scale-105"
                >
                  {hero.cta1}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {hasVideo && (
                  <a
                    href="#video"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    {hero.cta2}
                  </a>
                )}
              </div>
            </div>

            {/* RIGHT: commercial photo */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-3 rounded-[2.5rem] border border-white/10" />
                <div className="absolute inset-0 rounded-3xl bg-[var(--color-green-bright)] opacity-10 blur-2xl" />
                <HeroImage src={settings?.heroImage} />
                <div className="absolute -bottom-4 -left-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{overlayCard.label}</p>
                  <p className="text-base font-black text-white">{overlayCard.year}</p>
                  {overlayCard.collection && (
                    <p className="text-xs text-white/70">{overlayCard.collection}</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">Scroll</span>
          <div className="h-10 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── USP BAR ──────────────────────────────────────────────────── */}
      <section className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            {usp.map((item, i) => {
              const Icon = USP_ICONS[i] ?? Star;
              return (
                <Reveal key={i} delay={i * 80} className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg)] ring-1 ring-[var(--color-border)]">
                    <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text)]">{item.label}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VIDEO ────────────────────────────────────────────────────── */}
      {videoUrl && (
        <section id="video" className="py-24 bg-[var(--color-bg)]">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">
                {video.label}
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)] md:text-4xl">
                {video.title}
              </h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{video.desc}</p>
            </Reveal>

            <Reveal delay={120} className="relative aspect-video w-full overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-lg">
              <AutoPlayVideo src={videoUrl} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ── PRODUCTS ─────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--color-border)] py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">
                {collection.label}
              </p>
              <h2 className="mt-1 text-3xl font-bold text-[var(--color-text)]">{collection.title}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{collection.desc}</p>
            </div>
            <Link
              href={shopHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] transition hover:text-[var(--color-green-mid)]"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <ProductGrid products={products} hrefBase={shopHrefBase} />
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-[var(--color-border)] py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-green-dark)] to-[var(--color-green)]" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, var(--color-green-light) 0%, transparent 70%)" }}
        />
        <Reveal className="relative mx-auto max-w-xl px-6 text-center">
          <h2 className="text-3xl font-black text-white md:text-5xl">{footerCta.title}</h2>
          <p className="mt-4 text-white/60">{footerCta.desc}</p>
          <Link
            href={shopHref}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-green-bright)] px-10 py-4 text-sm font-bold text-[var(--color-green-dark)] shadow-[0_8px_30px_rgba(158,212,58,0.3)] transition hover:scale-105"
          >
            {footerCta.btn} <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
