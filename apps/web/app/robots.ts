import type { MetadataRoute } from "next";
import { getCachedStoreSettings, getStaticSiteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settingsResult = await getCachedStoreSettings();
  const indexingEnabled = settingsResult.success ? (settingsResult.data?.seoIndexingEnabled ?? true) : true;

  if (!indexingEnabled) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api", "/cart", "/checkout"],
    },
    sitemap: `${getStaticSiteUrl()}/sitemap.xml`,
  };
}
