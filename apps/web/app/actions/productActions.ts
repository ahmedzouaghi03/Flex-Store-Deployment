"use server";

import { db, type Gender } from "@shoestore/db";
import type { ActionResult, ColorImage, SizeStock, ProductDetail, ProductListItem } from "@/types";

function parseSizeEntry(entry: string): SizeStock {
  try { return JSON.parse(entry) as SizeStock; }
  catch { return { size: entry, stock: 99 }; }
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

export type ShopFilters = {
  gender?: Gender;
  brandSlug?: string;
  categorySlug?: string;
  search?: string;
};

function mapListItem(product: {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  images: string[];
  gender: string;
  isFeatured: boolean;
  brand: { name: string } | null;
}): ProductListItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    priceCents: product.priceCents,
    compareAtPriceCents: product.compareAtPriceCents,
    imageUrl: product.images[0] ?? null,
    brandName: product.brand?.name ?? null,
    gender: product.gender,
    isFeatured: product.isFeatured,
  };
}

export async function getPublishedProducts(
  filters?: ShopFilters,
): Promise<ActionResult<ProductListItem[]>> {
  try {
    const search = filters?.search?.trim();

    const products = await db.product.findMany({
      where: {
        isPublished: true,
        isDeleted: false,
        ...(filters?.gender ? { gender: filters.gender } : {}),
        ...(filters?.brandSlug
          ? { brand: { slug: filters.brandSlug, isDeleted: false } }
          : {}),
        ...(filters?.categorySlug
          ? {
              categories: {
                some: { slug: filters.categorySlug, isDeleted: false },
              },
            }
          : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        brand: { select: { name: true } },
      },
    });

    return { success: true, data: products.map(mapListItem) };
  } catch (error) {
    console.error("[PRODUCTS] list error:", error);
    return { success: false, error: "Failed to load products" };
  }
}

export async function getFeaturedProducts(): Promise<
  ActionResult<ProductListItem[]>
> {
  try {
    const products = await db.product.findMany({
      where: { isPublished: true, isDeleted: false, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { brand: { select: { name: true } } },
    });
    return { success: true, data: products.map(mapListItem) };
  } catch (error) {
    console.error("[PRODUCTS] featured error:", error);
    return { success: false, error: "Failed to load featured products" };
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<ActionResult<ProductDetail>> {
  if (!slug) return { success: false, error: "Product not found" };

  try {
    const product = await db.product.findFirst({
      where: { slug, isPublished: true, isDeleted: false },
      include: {
        brand: { select: { name: true } },
        categories: { select: { name: true } },
      },
    });

    if (!product) return { success: false, error: "Product not found" };

    return {
      success: true,
      data: {
        ...mapListItem(product),
        description: product.description,
        images: product.images,
        colorImages: product.colors.map(parseColorEntry),
        sizeStocks: product.sizes.map(parseSizeEntry),
        categories: product.categories.map((c) => c.name),
      },
    };
  } catch (error) {
    console.error("[PRODUCTS] detail error:", error);
    return { success: false, error: "Failed to load product" };
  }
}

export async function getShopFilters(): Promise<
  ActionResult<{
    brands: { name: string; slug: string }[];
    categories: { name: string; slug: string }[];
    genders: Gender[];
  }>
> {
  try {
    const [brands, categories] = await Promise.all([
      db.brand.findMany({
        where: { isDeleted: false },
        orderBy: { name: "asc" },
        select: { name: true, slug: true },
      }),
      db.category.findMany({
        where: { isDeleted: false },
        orderBy: { name: "asc" },
        select: { name: true, slug: true },
      }),
    ]);

    return {
      success: true,
      data: {
        brands,
        categories,
        genders: ["MEN", "WOMEN", "UNISEX", "KIDS"],
      },
    };
  } catch (error) {
    console.error("[PRODUCTS] filters error:", error);
    return { success: false, error: "Failed to load filters" };
  }
}
