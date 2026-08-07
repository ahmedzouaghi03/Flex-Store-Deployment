import { cache } from "react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import type { SerializedProduct } from "@/types";

export const DEFAULT_SITE_URL = "https://flex-tn.com";
export const DEFAULT_STORE_NAME = "Flex Comfort Shoes";
export const DEFAULT_SEO_TITLE =
  "Flex Comfort Shoes — Chaussures confortables, claquettes & semelles orthopédiques en Tunisie";
export const DEFAULT_SEO_DESCRIPTION =
  "Découvrez notre collection de chaussures confortables, claquettes et produits orthopédiques avec livraison rapide partout en Tunisie.";
export const DEFAULT_OG_IMAGE_PATH = "/icon.png";
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 160;

// Deduped across generateMetadata + page render + layout, same request — one DB query.
export const getCachedStoreSettings = cache(() => getStoreSettings());

async function resolveHostAndProtocol() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = headersList.get("x-forwarded-proto") ?? (isLocalhost ? "http" : "https");
  return { host, protocol };
}

/** Base URL of the current request's host (apex or www). */
export async function getBaseUrl(): Promise<string> {
  const { host, protocol } = await resolveHostAndProtocol();
  return `${protocol}://${host}`;
}

/** Base URL forced onto the shop.<domain> subdomain — where /shop, /product, /cart, /checkout live. */
export async function getShopBaseUrl(): Promise<string> {
  const { host, protocol } = await resolveHostAndProtocol();
  const [hostname, port] = host.split(":");
  const bareHost = hostname.replace(/^(shop|www)\./, "");
  const shopHost = `shop.${bareHost}${port ? `:${port}` : ""}`;
  return `${protocol}://${shopHost}`;
}

/**
 * Base URL of the apex marketing site (strips a "shop." prefix if present).
 * Needed for breadcrumb "Home" links from shop-subdomain pages — shop.<domain>/
 * is rewritten by middleware to serve /shop, not the marketing homepage.
 */
export async function getApexBaseUrl(): Promise<string> {
  const { host, protocol } = await resolveHostAndProtocol();
  const [hostname, port] = host.split(":");
  const bareHost = hostname.replace(/^(shop|www)\./, "");
  return `${protocol}://${bareHost}${port ? `:${port}` : ""}`;
}

/** Env-configured apex origin (no per-request host) — for sitemap.ts/robots.ts, which are cached via `revalidate` rather than per-request. */
export function getStaticSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

/** Env-configured shop.<domain> origin — see getStaticSiteUrl(). */
export function getStaticShopUrl(): string {
  const site = getStaticSiteUrl();
  return site.replace(/^(https?:\/\/)(www\.)?/, "$1shop.");
}

export function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

export function buildRobotsMeta(indexingEnabled: boolean): NonNullable<Metadata["robots"]> {
  return indexingEnabled ? { index: true, follow: true } : { index: false, follow: false };
}

export type SiteIdentity = {
  storeName: string;
  logo: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  indexingEnabled: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string | null;
    canonicalOverride: string | null;
    ogTitle: string;
    ogDescription: string;
    ogImage: string | null;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string | null;
  };
};

/** Global fallback chain: admin-set SEO settings → safe defaults. */
export async function getSiteIdentity(): Promise<SiteIdentity> {
  const result = await getCachedStoreSettings();
  const s = result.success ? result.data : undefined;

  const storeName = s?.orgName?.trim() || DEFAULT_STORE_NAME;
  const title = s?.seoTitle?.trim() || DEFAULT_SEO_TITLE;
  const description = s?.seoDescription?.trim() || DEFAULT_SEO_DESCRIPTION;
  const ogImage = s?.seoOgImage?.trim() || null;

  return {
    storeName,
    logo: s?.logoUrl || null,
    email: s?.contactEmail || null,
    phone: s?.contactPhone || null,
    address: s?.contactLocation || null,
    indexingEnabled: s?.seoIndexingEnabled ?? true,
    seo: {
      title,
      description,
      keywords: s?.seoKeywords?.trim() || null,
      canonicalOverride: s?.seoCanonicalUrl?.trim() || null,
      ogTitle: s?.seoOgTitle?.trim() || title,
      ogDescription: s?.seoOgDescription?.trim() || description,
      ogImage,
      twitterTitle: s?.seoTwitterTitle?.trim() || title,
      twitterDescription: s?.seoTwitterDescription?.trim() || description,
      twitterImage: s?.seoTwitterImage?.trim() || ogImage,
    },
  };
}

// ─── JSON-LD builders — real data only, nothing fabricated ───────────────────

export function organizationJsonLd(identity: SiteIdentity, url: string) {
  const { storeName, logo, email, phone, address } = identity;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeName,
    url,
    ...(logo && { logo }),
    ...(email && { email }),
    ...(phone && { telephone: phone }),
    ...(address && { address }),
  };
}

export function websiteJsonLd({
  url,
  storeName,
  shopUrl,
}: {
  url: string;
  storeName: string;
  shopUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: storeName,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${shopUrl}?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd({
  product,
  url,
  storeName,
}: {
  product: SerializedProduct;
  url: string;
  storeName: string;
}) {
  const images =
    product.images.length > 0
      ? product.images.map((i) => i.url)
      : product.primaryImage
        ? [product.primaryImage]
        : [];
  const totalStock = product.colors.reduce(
    (sum, c) => sum + c.sizes.reduce((s, sz) => s + sz.stock, 0),
    0,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(images.length > 0 && { image: images }),
    ...((product.seoDescription || product.description) && {
      description: product.seoDescription || product.description,
    }),
    sku: product.id,
    ...(product.category && { category: product.category.name }),
    brand: { "@type": "Brand", name: storeName },
    // Price on request (basePrice <= 0) has no real price to publish — omit the offer entirely.
    ...(product.basePrice > 0 && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "TND",
        price: product.basePrice.toFixed(3),
        availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    }),
  };
}

export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}
