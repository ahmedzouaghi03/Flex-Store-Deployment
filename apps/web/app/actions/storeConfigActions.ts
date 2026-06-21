"use server";

import { revalidatePath } from "next/cache";
import { getStoreConfig, saveStoreConfig, DEFAULT_CONFIG } from "@/lib/store-config";
import type { StoreConfig, StoreColors } from "@/lib/store-config";

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

export async function saveDeliveryFee(
  deliveryFeeCents: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!Number.isInteger(deliveryFeeCents) || deliveryFeeCents < 0) {
      return { success: false, error: "Delivery fee must be a non-negative amount" };
    }
    const config = getStoreConfig();
    config.deliveryFeeCents = deliveryFeeCents;
    saveStoreConfig(config);
    revalidateAll();
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save" };
  }
}

export async function getDeliveryFeeCents(): Promise<number> {
  return getStoreConfig().deliveryFeeCents;
}
