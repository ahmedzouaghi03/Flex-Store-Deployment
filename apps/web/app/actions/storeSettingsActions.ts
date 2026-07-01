"use server";

import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type { ActionResult, SerializedStoreSettings } from "@/types";

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
    usps: usps.map((u) => ({ id: u.id, label: u.label, desc: u.desc, order: u.order })),
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

export async function saveHeroSettings(data: {
  heroImage?: string | null;
  heroBadge?: string | null;
  heroLine1?: string | null;
  heroLine2?: string | null;
  heroLine3?: string | null;
  heroSubtitle?: string | null;
  heroCta1?: string | null;
  heroCta2?: string | null;
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
