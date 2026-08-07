"use server";

import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type { ActionResult, ContactInfo, SerializedStoreSettings, SeoSettingsInput } from "@/types";

const DEFAULT_CONTACT: ContactInfo = {
  email: "contact@flexshoes.tn",
  phone: "+216 XX XXX XXX",
  location: "Tunisia",
  responseTime: "Within 24 hours",
};

async function getOrCreate() {
  const existing = await db.storeSettings.findFirst();
  if (existing) return existing;
  return db.storeSettings.create({ data: {} });
}

function serialize(s: any, usps: any[]): SerializedStoreSettings {
  return {
    id: s.id,
    logoUrl: s.logoUrl,
    heroImage: s.heroImage,
    heroBadge: s.heroBadge,
    heroLine1: s.heroLine1,
    heroLine2: s.heroLine2,
    heroLine3: s.heroLine3,
    heroSubtitle: s.heroSubtitle,
    heroCta1: s.heroCta1,
    heroCta2: s.heroCta2,
    heroOverlayCardLabel: s.heroOverlayCardLabel,
    heroOverlayCardYear: s.heroOverlayCardYear,
    heroOverlayCardCollection: s.heroOverlayCardCollection,
    colorAccent: s.colorAccent,
    colorGreenDark: s.colorGreenDark,
    colorGreen: s.colorGreen,
    colorGreenMid: s.colorGreenMid,
    colorGreenLight: s.colorGreenLight,
    colorGreenBright: s.colorGreenBright,
    videoUrl: s.videoUrl,
    videoSectionLabel: s.videoSectionLabel,
    videoSectionTitle: s.videoSectionTitle,
    videoSectionDesc: s.videoSectionDesc,
    collectionLabel: s.collectionLabel,
    collectionTitle: s.collectionTitle,
    collectionDesc: s.collectionDesc,
    footerCtaTitle: s.footerCtaTitle,
    footerCtaDesc: s.footerCtaDesc,
    footerCtaBtn: s.footerCtaBtn,
    deliveryFee: Number(s.deliveryFee),
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    contactLocation: s.contactLocation,
    contactResponseTime: s.contactResponseTime,
    usps: usps.map((u) => ({ id: u.id, label: u.label, desc: u.desc, order: u.order })),
    orgName: s.orgName,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    seoKeywords: s.seoKeywords,
    seoCanonicalUrl: s.seoCanonicalUrl,
    seoOgTitle: s.seoOgTitle,
    seoOgDescription: s.seoOgDescription,
    seoOgImage: s.seoOgImage,
    seoTwitterTitle: s.seoTwitterTitle,
    seoTwitterDescription: s.seoTwitterDescription,
    seoTwitterImage: s.seoTwitterImage,
    seoIndexingEnabled: s.seoIndexingEnabled,
  };
}

export async function getStoreSettings(): Promise<ActionResult<SerializedStoreSettings>> {
  try {
    const settings = await getOrCreate();
    const usps = await db.storeUsp.findMany({
      where: { storeId: settings.id },
      orderBy: { order: "asc" },
    });
    return { success: true, data: serialize(settings, usps) };
  } catch (error) {
    console.error("[STORE SETTINGS] get error:", error);
    return { success: false, error: "Failed to load store settings" };
  }
}

export async function saveDeliveryFee(deliveryFee: number): Promise<ActionResult> {
  try {
    if (isNaN(deliveryFee) || deliveryFee < 0) {
      return { success: false, error: "Delivery fee must be a non-negative amount" };
    }
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data: { deliveryFee } });
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveDeliveryFee error:", error);
    return { success: false, error: "Failed to save delivery fee" };
  }
}

export async function saveLogoUrl(logoUrl: string): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data: { logoUrl } });
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveLogoUrl error:", error);
    return { success: false, error: "Failed to save logo" };
  }
}

export async function saveHeroSettings(data: {
  heroImage?: string | null;
  heroBadge?: string | null;
  heroLine1?: string | null;
  heroLine2?: string | null;
  heroLine3?: string | null;
  heroSubtitle?: string | null;
  heroCta1?: string | null;
  heroCta2?: string | null;
  heroOverlayCardLabel?: string | null;
  heroOverlayCardYear?: string | null;
  heroOverlayCardCollection?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveHero error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveColorSettings(data: {
  colorAccent?: string | null;
  colorGreenDark?: string | null;
  colorGreen?: string | null;
  colorGreenMid?: string | null;
  colorGreenLight?: string | null;
  colorGreenBright?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveColors error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveVideoSettings(data: {
  videoUrl?: string | null;
  videoSectionLabel?: string | null;
  videoSectionTitle?: string | null;
  videoSectionDesc?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveVideo error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveCollectionSettings(data: {
  collectionLabel?: string | null;
  collectionTitle?: string | null;
  collectionDesc?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveCollection error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveFooterSettings(data: {
  footerCtaTitle?: string | null;
  footerCtaDesc?: string | null;
  footerCtaBtn?: string | null;
}): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeSettings.update({ where: { id: settings.id }, data });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveFooter error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function saveSeoSettings(data: SeoSettingsInput): Promise<ActionResult> {
  try {
    const orgName = data.orgName.trim();
    const seoTitle = data.seoTitle.trim();
    const seoDescription = data.seoDescription.trim();
    if (!orgName) return { success: false, error: "Organization name is required" };
    if (!seoTitle) return { success: false, error: "SEO title is required" };
    if (!seoDescription) return { success: false, error: "SEO description is required" };

    const settings = await getOrCreate();
    await db.storeSettings.update({
      where: { id: settings.id },
      data: {
        orgName,
        seoTitle,
        seoDescription,
        seoKeywords: data.seoKeywords.trim() || null,
        seoCanonicalUrl: data.seoCanonicalUrl.trim() || null,
        seoOgTitle: data.seoOgTitle.trim() || null,
        seoOgDescription: data.seoOgDescription.trim() || null,
        seoOgImage: data.seoOgImage.trim() || null,
        seoTwitterTitle: data.seoTwitterTitle.trim() || null,
        seoTwitterDescription: data.seoTwitterDescription.trim() || null,
        seoTwitterImage: data.seoTwitterImage.trim() || null,
        seoIndexingEnabled: data.seoIndexingEnabled,
      },
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveSeoSettings error:", error);
    return { success: false, error: "Failed to save SEO settings" };
  }
}

export async function saveUsps(
  items: { label: string; desc: string; order: number }[],
): Promise<ActionResult> {
  try {
    const settings = await getOrCreate();
    await db.storeUsp.deleteMany({ where: { storeId: settings.id } });
    await db.storeUsp.createMany({
      data: items.map((u) => ({ ...u, storeId: settings.id })),
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveUsps error:", error);
    return { success: false, error: "Failed to save" };
  }
}

export async function getDeliveryFee(): Promise<number> {
  try {
    const settings = await db.storeSettings.findFirst({ select: { deliveryFee: true } });
    return settings ? Number(settings.deliveryFee) : 0;
  } catch {
    return 0;
  }
}

export async function getContactInfo(): Promise<ContactInfo> {
  try {
    const settings = await db.storeSettings.findFirst({
      select: {
        contactEmail: true,
        contactPhone: true,
        contactLocation: true,
        contactResponseTime: true,
      },
    });
    if (!settings) return DEFAULT_CONTACT;
    return {
      email: settings.contactEmail?.trim() || DEFAULT_CONTACT.email,
      phone: settings.contactPhone?.trim() || DEFAULT_CONTACT.phone,
      location: settings.contactLocation?.trim() || DEFAULT_CONTACT.location,
      responseTime: settings.contactResponseTime?.trim() || DEFAULT_CONTACT.responseTime,
    };
  } catch {
    return DEFAULT_CONTACT;
  }
}

export async function saveContactInfo(data: {
  email: string;
  phone: string;
  location: string;
  responseTime: string;
}): Promise<ActionResult> {
  try {
    const email = data.email.trim();
    const phone = data.phone.trim();
    const location = data.location.trim();
    const responseTime = data.responseTime.trim();

    if (!email || !phone || !location) {
      return { success: false, error: "Email, phone, and location are required" };
    }

    const settings = await getOrCreate();
    await db.storeSettings.update({
      where: { id: settings.id },
      data: {
        contactEmail: email,
        contactPhone: phone,
        contactLocation: location,
        contactResponseTime: responseTime || DEFAULT_CONTACT.responseTime,
      },
    });
    revalidatePath("/contact");
    return { success: true };
  } catch (error) {
    console.error("[STORE SETTINGS] saveContactInfo error:", error);
    return { success: false, error: "Failed to save contact info" };
  }
}
