import { getStoreSettings } from "@/actions/storeSettingsActions";
import { getStaticSiteUrl } from "@/lib/seo";
import { SeoSettingsClient } from "@/components/admin/SeoSettingsClient";

export async function SeoSettingsContent() {
  const result = await getStoreSettings();
  if (!result.success || !result.data) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load SEO settings.
      </p>
    );
  }

  return <SeoSettingsClient initial={result.data} siteUrl={getStaticSiteUrl()} />;
}
