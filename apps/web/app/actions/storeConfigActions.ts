"use server";

import { revalidatePath } from "next/cache";
import {
  getStoreConfig,
  saveStoreConfig,
  DEFAULT_CONFIG,
} from "@/lib/store-config";
import type { StoreConfig, StoreColors } from "@/lib/store-config";
import { isAdmin } from "@/lib/auth-guard";

function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath("/shop");
}

export async function saveHeroText(
  data: StoreConfig["hero"],
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
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
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
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
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
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
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
    const config = getStoreConfig();
    config.footerCta = data;
    saveStoreConfig(config);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save" };
  }
}

export async function resetToDefault(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
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
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
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
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
    const config = getStoreConfig();
    config.colors = colors;
    saveStoreConfig(config);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save" };
  }
}
