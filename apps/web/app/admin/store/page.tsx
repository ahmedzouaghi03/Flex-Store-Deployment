import { existsSync } from "fs";
import { join } from "path";
import { getStoreConfig } from "@/lib/store-config";
import { getDeliveryFeeCents, getContactInfo } from "@/actions/storeConfigActions";
import { StoreSettingsClient } from "@/components/admin/StoreSettingsClient";

export default async function StoreSettingsPage() {
  const config = getStoreConfig();
  const hasVideo = existsSync(join(process.cwd(), "public", "store-video.mp4"));
  const [deliveryFeeCents, contactInfo] = await Promise.all([
    getDeliveryFeeCents(),
    getContactInfo(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Store Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Edit your store&apos;s content, colors, and media. The preview on the right
          updates live as you type — click <strong>Save Changes</strong> to publish.
        </p>
      </div>

      <StoreSettingsClient
        config={{ ...config, deliveryFeeCents }}
        hasVideo={hasVideo}
        contactInfo={contactInfo}
      />
    </div>
  );
}
