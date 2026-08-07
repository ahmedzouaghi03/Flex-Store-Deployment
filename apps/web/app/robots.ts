import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getCachedStoreSettings, getStaticSiteUrl, getStaticShopUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settingsResult = await getCachedStoreSettings();
  const indexingEnabled = settingsResult.success ? (settingsResult.data?.seoIndexingEnabled ?? true) : true;

  if (!indexingEnabled) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  // Each host points at its own sitemap — matches app/sitemap.ts's per-host split.
  const hostname = (await headers()).get("host")?.split(":")[0] ?? "";
  const onShop = hostname.startsWith("shop.");
  const sitemapUrl = `${onShop ? getStaticShopUrl() : getStaticSiteUrl()}/sitemap.xml`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api", "/cart", "/checkout"],
    },
    sitemap: sitemapUrl,
  };
}
