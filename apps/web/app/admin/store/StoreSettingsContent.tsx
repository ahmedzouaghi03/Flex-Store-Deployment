import { getStoreConfig } from "@/lib/store-config";
import { getDeliveryFeeCents, getContactInfo } from "@/actions/storeConfigActions";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { StoreSettingsClient } from "@/components/admin/StoreSettingsClient";

export async function StoreSettingsContent() {
  const config = getStoreConfig();
  const [deliveryFeeCents, contactInfo, settingsResult] = await Promise.all([
    getDeliveryFeeCents(),
    getContactInfo(),
    getStoreSettings(),
  ]);
  const settings = settingsResult.success ? settingsResult.data! : null;

  return (
    <StoreSettingsClient
      config={{ ...config, deliveryFeeCents }}
      contactInfo={contactInfo}
      media={{
        logoUrl: settings?.logoUrl ?? null,
        heroImage: settings?.heroImage ?? null,
        videoUrl: settings?.videoUrl ?? null,
        overlayCard: {
          label: settings?.heroOverlayCardLabel ?? "Collection",
          year: settings?.heroOverlayCardYear ?? "2025",
          collection: settings?.heroOverlayCardCollection ?? "",
        },
      }}
    />
  );
}
