"use server";

import { revalidatePath } from "next/cache";
import { getStoreConfig, saveStoreConfig, DEFAULT_CONFIG } from "@/lib/store-config";
import { getDeliveryFee as getDeliveryFeeFromDB, saveDeliveryFee as saveDeliveryFeeInDB, getContactInfo as getContactInfoFromDB, saveContactInfo as saveContactInfoInDB } from "./storeSettingsActions";
import type { StoreConfig, StoreColors } from "@/lib/store-config";
import type { ContactInfo } from "@/types";

function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath("/shop");
}

export async function saveHeroText(
  data: StoreConfig["hero"],
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getStoreConfig();
    config.hero = data;
    saveStoreConfig(config);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save" };
  }
}

export async function saveVideoText(
  data: StoreConfig["video"],
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getStoreConfig();
    config.video = data;
    saveStoreConfig(config);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save" };
  }
}

export async function saveUsp(
  data: StoreConfig["usp"],
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getStoreConfig();
    config.usp = data;
    saveStoreConfig(config);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save" };
  }
}

export async function saveFooterCta(
  data: StoreConfig["footerCta"],
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getStoreConfig();
    config.footerCta = data;
    saveStoreConfig(config);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save" };
  }
}

export async function resetToDefault(): Promise<{ success: boolean; error?: string }> {
  try {
    saveStoreConfig(DEFAULT_CONFIG);
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to reset" };
  }
}

export async function savePhotoCard(
  data: StoreConfig["photoCard"],
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getStoreConfig();
    config.photoCard = data;
    saveStoreConfig(config);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save" };
  }
}

export async function saveColors(
  colors: StoreColors,
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getStoreConfig();
    config.colors = colors;
    saveStoreConfig(config);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save" };
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
