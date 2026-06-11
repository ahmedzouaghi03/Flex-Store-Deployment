"use server";

import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type { ActionResult, ProductInput, AdminProductDetail, ColorImage, SizeStock } from "@/types";

function parseSizeEntry(entry: string): SizeStock {
  try { return JSON.parse(entry) as SizeStock; }
  catch { return { size: entry, stock: 99 }; }
}
function serializeSizes(sizeStocks: SizeStock[]): string[] {
  return sizeStocks.map((s) => JSON.stringify(s));
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseColorEntry(entry: string): ColorImage {
  try {
    const parsed = JSON.parse(entry) as {
      name: string;
      hex?: string;
      imageUrl?: string;
      imageUrls?: string[];
    };
    return {
      name: parsed.name,
      hex: parsed.hex ?? "#888888",
      imageUrls: parsed.imageUrls ?? (parsed.imageUrl ? [parsed.imageUrl] : []),
    };
  } catch {
    return { name: entry, hex: "#888888", imageUrls: [] };
  }
}

function serializeColors(colorImages: ColorImage[]): string[] {
  return colorImages.map((c) =>
    JSON.stringify({ name: c.name, hex: c.hex, imageUrls: c.imageUrls }),
  );
}

export async function getAdminProducts(): Promise<
  ActionResult<(AdminProductDetail & { brandName: string | null })[]>
> {
  try {
    const products = await db.product.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: { brand: { select: { name: true } } },
    });
    return {
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceCents: p.priceCents,
        images: p.images,
        sizeStocks: p.sizes.map(parseSizeEntry),
        colorImages: p.colors.map(parseColorEntry),
        isPublished: p.isPublished,
        isFeatured: p.isFeatured,
        brandName: p.brand?.name ?? null,
      })),
    };
  } catch (error) {
    console.error("[ADMIN] list error:", error);
    return { success: false, error: "Failed to load products" };
  }
}

export async function getProductForEdit(
  slug: string,
): Promise<ActionResult<AdminProductDetail>> {
  try {
    const p = await db.product.findUnique({ where: { slug, isDeleted: false } });
    if (!p) return { success: false, error: "Product not found" };
    return {
      success: true,
      data: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceCents: p.priceCents,
        images: p.images,
        sizeStocks: p.sizes.map(parseSizeEntry),
        colorImages: p.colors.map(parseColorEntry),
        isPublished: p.isPublished,
        isFeatured: p.isFeatured,
      },
    };
  } catch (error) {
    console.error("[ADMIN] getProductForEdit error:", error);
    return { success: false, error: "Failed to load product" };
  }
}

export async function createProduct(
  data: ProductInput,
): Promise<ActionResult<{ slug: string }>> {
  try {
    if (!data.name) return { success: false, error: "Name is required" };

    const baseSlug = toSlug(data.name);
    const exists = await db.product.findUnique({ where: { slug: baseSlug } });
    const slug = exists ? `${baseSlug}-${Date.now()}` : baseSlug;

    await db.product.create({
      data: {
        name: data.name,
        slug,
        priceCents: data.priceCents,
        images: data.images.filter(Boolean),
        sizes: serializeSizes(data.sizeStocks),
        colors: serializeColors(data.colorImages),
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
      },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true, data: { slug } };
  } catch (error) {
    console.error("[ADMIN] createProduct error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  data: ProductInput,
): Promise<ActionResult> {
  try {
    await db.product.update({
      where: { id },
      data: {
        name: data.name,
        priceCents: data.priceCents,
        images: data.images.filter(Boolean),
        sizes: serializeSizes(data.sizeStocks),
        colors: serializeColors(data.colorImages),
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
      },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] updateProduct error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await db.product.update({ where: { id }, data: { isDeleted: true } });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] delete error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function toggleProductPublished(id: string, value: boolean): Promise<ActionResult> {
  try {
    await db.product.update({ where: { id }, data: { isPublished: value } });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}

export async function toggleProductFeatured(id: string, value: boolean): Promise<ActionResult> {
  try {
    await db.product.update({ where: { id }, data: { isFeatured: value } });
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}
