import type { MetadataRoute } from "next";
import { getCachedStoreSettings, getStaticSiteUrl, getStaticShopUrl } from "@/lib/seo";
import { getPublishedProducts } from "@/actions/productActions";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settingsResult = await getCachedStoreSettings();
  const indexingEnabled = settingsResult.success ? (settingsResult.data?.seoIndexingEnabled ?? true) : true;
  if (!indexingEnabled) return [];

  const siteUrl = getStaticSiteUrl();
  const shopUrl = getStaticShopUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${shopUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
  ];

  const productsResult = await getPublishedProducts();
  const products = productsResult.success ? (productsResult.data ?? []) : [];

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${shopUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
