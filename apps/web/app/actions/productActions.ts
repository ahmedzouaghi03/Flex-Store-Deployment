"use server";

import { db } from "@shoestore/db";
import type { ActionResult, SerializedProduct, SerializedProductColor } from "@/types";

function serializeColor(color: {
  id: string;
  name: string;
  hex: string | null;
  isActive: boolean;
  images: { id: string; url: string; alt: string | null; order: number }[];
  sizes: { id: string; size: string; stock: number; priceOverride: any }[];
}): SerializedProductColor {
  return {
    id: color.id,
    name: color.name,
    hex: color.hex,
    isActive: color.isActive,
    images: color.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      order: img.order,
    })),
    sizes: color.sizes.map((s) => ({
      id: s.id,
      size: s.size,
      stock: s.stock,
      priceOverride: s.priceOverride != null ? Number(s.priceOverride) : null,
    })),
  };
}

function serializeProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: any;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string } | null;
  images: { id: string; url: string; alt: string | null; order: number }[];
  colors: any[];
}): SerializedProduct {
  const primaryImage =
    product.images[0]?.url ?? product.colors[0]?.images[0]?.url ?? null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: Number(product.basePrice),
    primaryImage,
    images: product.images.map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      order: i.order,
    })),
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    category: product.category ?? null,
    colors: product.colors.map(serializeColor),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { order: "asc" as const } },
  colors: {
    where: { isActive: true },
    orderBy: { order: "asc" as const },
    include: {
      images: { orderBy: { order: "asc" as const } },
      sizes: { orderBy: { size: "asc" as const } },
    },
  },
} as const;

export async function getPublishedProducts(filters?: {
  categorySlug?: string;
  search?: string;
}): Promise<ActionResult<SerializedProduct[]>> {
  try {
    const search = filters?.search?.trim();
    const products = await db.product.findMany({
      where: {
        isPublished: true,
        ...(filters?.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      include: PRODUCT_INCLUDE,
    });
    return { success: true, data: products.map(serializeProduct) };
  } catch (error) {
    console.error("[PRODUCTS] list error:", error);
    return { success: false, error: "Failed to load products" };
  }
}

export async function getFeaturedProducts(): Promise<ActionResult<SerializedProduct[]>> {
  try {
    const products = await db.product.findMany({
      where: { isPublished: true, isFeatured: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 6,
      include: PRODUCT_INCLUDE,
    });
    return { success: true, data: products.map(serializeProduct) };
  } catch (error) {
    console.error("[PRODUCTS] featured error:", error);
    return { success: false, error: "Failed to load featured products" };
  }
}

export async function getProductBySlug(slug: string): Promise<ActionResult<SerializedProduct>> {
  if (!slug) return { success: false, error: "Product not found" };
  try {
    const product = await db.product.findFirst({
      where: { slug, isPublished: true },
      include: PRODUCT_INCLUDE,
    });
    if (!product) return { success: false, error: "Product not found" };
    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    console.error("[PRODUCTS] detail error:", error);
    return { success: false, error: "Failed to load product" };
  }
}

export async function getProductColors(
  productId: string,
): Promise<ActionResult<SerializedProductColor[]>> {
  if (!productId) return { success: false, error: "Product not found" };
  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { colors: PRODUCT_INCLUDE.colors },
    });
    if (!product) return { success: false, error: "Product not found" };
    return { success: true, data: product.colors.map(serializeColor) };
  } catch (error) {
    console.error("[PRODUCTS] colors error:", error);
    return { success: false, error: "Failed to load product options" };
  }
}

export async function getCategories(): Promise<
  ActionResult<{ id: string; name: string; slug: string }[]>
> {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("[PRODUCTS] categories error:", error);
    return { success: false, error: "Failed to load categories" };
  }
}
