import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getCachedStoreSettings, getStaticSiteUrl, getStaticShopUrl } from "@/lib/seo";
import { getPublishedProducts, getCategories } from "@/actions/productActions";

// Apex (flex-tn.com) and shop (shop.flex-tn.com) each serve their own /sitemap.xml,
// scoped to the pages that actually live on that host — reading the request host makes
// this route dynamic (no static revalidate), same as any Route Handler using headers().
function apexSitemap(): MetadataRoute.Sitemap {
  const siteUrl = getStaticSiteUrl();
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];
}

async function shopSitemap(): Promise<MetadataRoute.Sitemap> {
  const shopUrl = getStaticShopUrl();

  const [productsResult, categoriesResult] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
  ]);
  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const categories = categoriesResult.success ? (categoriesResult.data ?? []) : [];

  // Matches the canonical URL shop/page.tsx sets for a pure category filter.
  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${shopUrl}/shop?category=${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${shopUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: `${shopUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    ...categoryEntries,
    ...productEntries,
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settingsResult = await getCachedStoreSettings();
  const indexingEnabled = settingsResult.success ? (settingsResult.data?.seoIndexingEnabled ?? true) : true;
  if (!indexingEnabled) return [];

  const hostname = (await headers()).get("host")?.split(":")[0] ?? "";
  const onShop = hostname.startsWith("shop.");

  return onShop ? shopSitemap() : apexSitemap();
}
