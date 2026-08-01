"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_COLORS } from "@/lib/store-config";
import {
  getDeliveryFee as getDeliveryFeeFromDB,
  saveDeliveryFee as saveDeliveryFeeInDB,
  getContactInfo as getContactInfoFromDB,
  saveContactInfo as saveContactInfoInDB,
  saveHeroSettings,
  saveColorSettings,
  saveVideoSettings,
  saveFooterSettings,
  saveCollectionSettings,
  saveUsps,
} from "./storeSettingsActions";
import type { ContactInfo } from "@/types";
import { DEFAULT_HERO, DEFAULT_VIDEO, DEFAULT_FOOTER_CTA, DEFAULT_COLLECTION, DEFAULT_USPS } from "@/types";

export async function resetToDefault(): Promise<{ success: boolean; error?: string }> {
  try {
    await saveHeroSettings({
      heroBadge: DEFAULT_HERO.badge,
      heroLine1: DEFAULT_HERO.line1,
      heroLine2: DEFAULT_HERO.line2,
      heroLine3: DEFAULT_HERO.line3,
      heroSubtitle: DEFAULT_HERO.subtitle,
      heroCta1: DEFAULT_HERO.cta1,
      heroCta2: DEFAULT_HERO.cta2,
    });
    await saveColorSettings({
      colorAccent: DEFAULT_COLORS.accent,
      colorGreenDark: DEFAULT_COLORS["green-dark"],
      colorGreen: DEFAULT_COLORS.green,
      colorGreenMid: DEFAULT_COLORS["green-mid"],
      colorGreenLight: DEFAULT_COLORS["green-light"],
      colorGreenBright: DEFAULT_COLORS["green-bright"],
    });
    await saveVideoSettings({
      videoSectionLabel: DEFAULT_VIDEO.label,
      videoSectionTitle: DEFAULT_VIDEO.title,
      videoSectionDesc: DEFAULT_VIDEO.desc,
    });
    await saveFooterSettings({
      footerCtaTitle: DEFAULT_FOOTER_CTA.title,
      footerCtaDesc: DEFAULT_FOOTER_CTA.desc,
      footerCtaBtn: DEFAULT_FOOTER_CTA.btn,
    });
    await saveCollectionSettings({
      collectionLabel: DEFAULT_COLLECTION.label,
      collectionTitle: DEFAULT_COLLECTION.title,
      collectionDesc: DEFAULT_COLLECTION.desc,
    });
    await saveUsps(DEFAULT_USPS.map((u, order) => ({ ...u, order })));
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to reset" };
  }
}

// deliveryFee is in cents (legacy admin UI convention) — convert to TND before storing
export async function saveDeliveryFee(
  deliveryFeeCents: number,
): Promise<{ success: boolean; error?: string }> {
  const result = await saveDeliveryFeeInDB(deliveryFeeCents / 100);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { success: true };
}

export async function getDeliveryFee(): Promise<number> {
  return getDeliveryFeeFromDB();
}

// Legacy alias — delivery fee is now stored in TND, not cents
export async function getDeliveryFeeCents(): Promise<number> {
  const tnd = await getDeliveryFeeFromDB();
  return Math.round(tnd * 100);
}

export async function getContactInfo(): Promise<ContactInfo> {
  return getContactInfoFromDB();
}

export async function saveContactInfo(
  data: ContactInfo,
): Promise<{ success: boolean; error?: string }> {
  const result = await saveContactInfoInDB(data);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath("/contact");
  return { success: true };
}
