"use server";

import { revalidatePath } from "next/cache";
import { db, type Gender } from "@shoestore/db";
import { z } from "zod";
import type {
  ActionResult,
  ColorImage,
  SizeStock,
  ProductDetail,
  ProductListItem,
  AdminProductDetail,
  ProductInput,
} from "@/types";
import { isAdmin } from "@/lib/auth-guard";

const sizeStockSchema = z.object({
  size: z.string().trim().min(1),
  stock: z.number().int().min(0),
});

const colorImageSchema = z.object({
  name: z.string().trim().min(1),
  hex: z.string().trim(),
  imageUrls: z.array(z.string().trim()),
});

const productInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  priceCents: z.number().int().min(0),
  images: z.array(z.string().trim()).default([]),
  sizeStocks: z.array(sizeStockSchema).default([]),
  colorImages: z.array(colorImageSchema).default([]),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
}) satisfies z.ZodType<ProductInput>;

const idSchema = z.ulid();

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseSizeEntry(entry: string): SizeStock {
  try {
    return JSON.parse(entry) as SizeStock;
  } catch {
    return { size: entry, stock: 99 };
  }
}

function serializeSizes(sizeStocks: SizeStock[]): string[] {
  return sizeStocks.map((s) => JSON.stringify(s));
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
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
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
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
    const p = await db.product.findUnique({
      where: { slug, isDeleted: false },
    });
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
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
    const parsed = productInputSchema.parse(data);
    const baseSlug = toSlug(parsed.name);
    const exists = await db.product.findUnique({ where: { slug: baseSlug } });
    const slug = exists ? `${baseSlug}-${Date.now()}` : baseSlug;
    await db.product.create({
      data: {
        name: parsed.name,
        slug,
        priceCents: parsed.priceCents,
        images: parsed.images.filter(Boolean),
        sizes: serializeSizes(parsed.sizeStocks),
        colors: serializeColors(parsed.colorImages),
        isPublished: parsed.isPublished,
        isFeatured: parsed.isFeatured,
      },
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true, data: { slug } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Invalid input",
      };
    }
    console.error("[PRODUCTS] createProduct error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  data: ProductInput,
): Promise<ActionResult> {
  try {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
    const safeId = idSchema.parse(id);
    const parsed = productInputSchema.parse(data);
    await db.product.update({
      where: { id: safeId },
      data: {
        name: parsed.name,
        priceCents: parsed.priceCents,
        images: parsed.images.filter(Boolean),
        sizes: serializeSizes(parsed.sizeStocks),
        colors: serializeColors(parsed.colorImages),
        isPublished: parsed.isPublished,
        isFeatured: parsed.isFeatured,
      },
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Invalid input",
      };
    }
    console.error("[PRODUCTS] updateProduct error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
    const safeId = idSchema.parse(id);
    await db.product.update({
      where: { id: safeId },
      data: { isDeleted: true },
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[PRODUCTS] delete error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function toggleProductPublished(
  id: string,
  value: boolean,
): Promise<ActionResult> {
  try {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
    const safeId = idSchema.parse(id);
    await db.product.update({
      where: { id: safeId },
      data: { isPublished: value },
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update product" };
  }
}

export async function toggleProductFeatured(
  id: string,
  value: boolean,
): Promise<ActionResult> {
  try {
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
    const safeId = idSchema.parse(id);
    await db.product.update({
      where: { id: safeId },
      data: { isFeatured: value },
    });
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update product" };
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
