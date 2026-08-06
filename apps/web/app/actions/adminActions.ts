"use server";

import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type {
  ActionResult,
  AdminProductDetail,
  ProductInput,
  ColorImage,
} from "@/types";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const ADMIN_INCLUDE = {
  category: { select: { id: true, name: true } },
  images: { orderBy: { order: "asc" as const } },
  colors: {
    orderBy: { order: "asc" as const },
    include: {
      images: { orderBy: { order: "asc" as const } },
      sizes: { orderBy: { size: "asc" as const } },
    },
  },
} as const;

function productToAdminDetail(p: any): AdminProductDetail {
  const images: string[] = (p.images ?? []).map((i: any) => i.url);
  const colorImages: ColorImage[] = p.colors.map((c: any) => ({
    name: c.name,
    hex: c.hex ?? "#888888",
    imageUrls: c.images.map((i: any) => i.url),
    sizes: c.sizes.map((s: any) => ({ size: s.size, stock: s.stock })),
  }));

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceCents: Math.round(Number(p.basePrice) * 100),
    images,
    colorImages,
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
    categoryId: p.categoryId ?? null,
    categoryName: p.category?.name ?? null,
  };
}

export async function getAdminProducts(): Promise<ActionResult<AdminProductDetail[]>> {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: ADMIN_INCLUDE,
    });
    return { success: true, data: products.map(productToAdminDetail) };
  } catch (error) {
    console.error("[ADMIN] list error:", error);
    return { success: false, error: "Failed to load products" };
  }
}

export async function getProductForEdit(
  slug: string,
): Promise<ActionResult<AdminProductDetail>> {
  try {
    const p = await db.product.findUnique({ where: { slug }, include: ADMIN_INCLUDE });
    if (!p) return { success: false, error: "Product not found" };
    return { success: true, data: productToAdminDetail(p) };
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
    const existing = await db.product.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    const basePrice = data.priceCents / 100;

    const colorsData = data.colorImages.map((c, colorIdx) => ({
      name: c.name,
      hex: c.hex,
      order: colorIdx,
      images: {
        create: c.imageUrls.map((url, imgIdx) => ({ url, order: imgIdx })),
      },
      sizes: {
        create: c.sizes.map((s) => ({ size: s.size, stock: s.stock })),
      },
    }));

    await db.product.create({
      data: {
        name: data.name,
        slug,
        basePrice,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId || null,
        images: {
          create: data.images.map((url, idx) => ({ url, order: idx })),
        },
        colors: { create: colorsData },
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
    const basePrice = data.priceCents / 100;

    // Delete existing images and colors (colors cascade to images and sizes)
    await db.productImage.deleteMany({ where: { productId: id } });
    await db.productColor.deleteMany({ where: { productId: id } });

    const colorsData = data.colorImages.map((c, colorIdx) => ({
      name: c.name,
      hex: c.hex,
      order: colorIdx,
      images: {
        create: c.imageUrls.map((url, imgIdx) => ({ url, order: imgIdx })),
      },
      sizes: {
        create: c.sizes.map((s) => ({ size: s.size, stock: s.stock })),
      },
    }));

    await db.product.update({
      where: { id },
      data: {
        name: data.name,
        basePrice,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId || null,
        images: {
          create: data.images.map((url, idx) => ({ url, order: idx })),
        },
        colors: { create: colorsData },
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
    await db.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] delete error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function toggleProductPublished(
  id: string,
  value: boolean,
): Promise<ActionResult> {
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

export async function toggleProductFeatured(
  id: string,
  value: boolean,
): Promise<ActionResult> {
  try {
    await db.product.update({ where: { id }, data: { isFeatured: value } });
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}

// ── Inline table edits ──────────────────────────────────────────────────────

export async function updateProductQuickFields(
  id: string,
  data: { name?: string; priceCents?: number },
): Promise<ActionResult> {
  try {
    const update: { name?: string; basePrice?: number } = {};
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) return { success: false, error: "Name cannot be empty" };
      update.name = name;
    }
    if (data.priceCents !== undefined) {
      if (isNaN(data.priceCents) || data.priceCents < 0) {
        return { success: false, error: "Enter a valid price" };
      }
      update.basePrice = data.priceCents / 100;
    }
    await db.product.update({ where: { id }, data: update });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] updateProductQuickFields error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// ── Bulk actions ─────────────────────────────────────────────────────────────

export async function bulkDeleteProducts(ids: string[]): Promise<ActionResult> {
  try {
    await db.product.deleteMany({ where: { id: { in: ids } } });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] bulkDeleteProducts error:", error);
    return { success: false, error: "Failed to delete products" };
  }
}

export async function bulkSetPublished(ids: string[], value: boolean): Promise<ActionResult> {
  try {
    await db.product.updateMany({ where: { id: { in: ids } }, data: { isPublished: value } });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] bulkSetPublished error:", error);
    return { success: false, error: "Failed to update products" };
  }
}

export async function bulkSetFeatured(ids: string[], value: boolean): Promise<ActionResult> {
  try {
    await db.product.updateMany({ where: { id: { in: ids } }, data: { isFeatured: value } });
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] bulkSetFeatured error:", error);
    return { success: false, error: "Failed to update products" };
  }
}
