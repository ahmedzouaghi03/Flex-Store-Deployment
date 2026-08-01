import { DEFAULT_COLORS } from "@/lib/store-config";
import { getDeliveryFeeCents, getContactInfo } from "@/actions/storeConfigActions";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { StoreSettingsClient } from "@/components/admin/StoreSettingsClient";
import { DEFAULT_HERO, DEFAULT_VIDEO, DEFAULT_FOOTER_CTA, DEFAULT_COLLECTION, DEFAULT_USPS } from "@/types";

export async function StoreSettingsContent() {
  const [deliveryFeeCents, contactInfo, settingsResult] = await Promise.all([
    getDeliveryFeeCents(),
    getContactInfo(),
    getStoreSettings(),
  ]);
  const settings = settingsResult.success ? settingsResult.data! : null;

  const hero = {
    badge: settings?.heroBadge ?? DEFAULT_HERO.badge,
    line1: settings?.heroLine1 ?? DEFAULT_HERO.line1,
    line2: settings?.heroLine2 ?? DEFAULT_HERO.line2,
    line3: settings?.heroLine3 ?? DEFAULT_HERO.line3,
    subtitle: settings?.heroSubtitle ?? DEFAULT_HERO.subtitle,
    cta1: settings?.heroCta1 ?? DEFAULT_HERO.cta1,
    cta2: settings?.heroCta2 ?? DEFAULT_HERO.cta2,
  };

  const colors = {
    accent: settings?.colorAccent ?? DEFAULT_COLORS.accent,
    "green-dark": settings?.colorGreenDark ?? DEFAULT_COLORS["green-dark"],
    green: settings?.colorGreen ?? DEFAULT_COLORS.green,
    "green-mid": settings?.colorGreenMid ?? DEFAULT_COLORS["green-mid"],
    "green-light": settings?.colorGreenLight ?? DEFAULT_COLORS["green-light"],
    "green-bright": settings?.colorGreenBright ?? DEFAULT_COLORS["green-bright"],
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

  const usps =
    settings && settings.usps.length > 0
      ? settings.usps.map((u) => ({ label: u.label, desc: u.desc }))
      : DEFAULT_USPS;

  return (
    <StoreSettingsClient
      hero={hero}
      colors={colors}
      video={video}
      footerCta={footerCta}
      collection={collection}
      usps={usps}
      deliveryFeeCents={deliveryFeeCents}
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
