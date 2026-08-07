"use server";

import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type { ActionResult, AdminCategory, CategoryInput } from "@/types";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toAdminCategory(c: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
  _count: { products: number };
}): AdminCategory {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    order: c.order,
    isActive: c.isActive,
    productCount: c._count.products,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
    seoKeywords: c.seoKeywords,
    ogImage: c.ogImage,
  };
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function getAdminCategories(): Promise<ActionResult<AdminCategory[]>> {
  try {
    const categories = await db.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    return { success: true, data: categories.map(toAdminCategory) };
  } catch (error) {
    console.error("[CATEGORIES] list error:", error);
    return { success: false, error: "Failed to load categories" };
  }
}

export async function createCategory(data: CategoryInput): Promise<ActionResult<{ id: string }>> {
  try {
    const name = data.name.trim();
    if (!name) return { success: false, error: "Name is required" };

    const baseSlug = toSlug(name);
    if (!baseSlug) return { success: false, error: "Name must contain letters or numbers" };
    const existing = await db.category.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const maxOrder = await db.category.aggregate({ _max: { order: true } });

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: data.description?.trim() || null,
        image: data.image?.trim() || null,
        isActive: data.isActive,
        order: (maxOrder._max.order ?? -1) + 1,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
      },
    });

    revalidateCategoryPaths();
    return { success: true, data: { id: category.id } };
  } catch (error) {
    console.error("[CATEGORIES] create error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: CategoryInput): Promise<ActionResult> {
  try {
    const name = data.name.trim();
    if (!name) return { success: false, error: "Name is required" };

    const current = await db.category.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Category not found" };

    let slug = current.slug;
    if (toSlug(name) !== current.slug) {
      const baseSlug = toSlug(name);
      if (!baseSlug) return { success: false, error: "Name must contain letters or numbers" };
      const existing = await db.category.findUnique({ where: { slug: baseSlug } });
      slug = existing && existing.id !== id ? `${baseSlug}-${Date.now()}` : baseSlug;
    }

    await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: data.description?.trim() || null,
        image: data.image?.trim() || null,
        isActive: data.isActive,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
      },
    });

    revalidateCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error("[CATEGORIES] update error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function toggleCategoryActive(id: string, value: boolean): Promise<ActionResult> {
  try {
    await db.category.update({ where: { id }, data: { isActive: value } });
    revalidateCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error("[CATEGORIES] toggle error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    // Product.categoryId is onDelete: SetNull — products keep existing, just lose their category.
    await db.category.delete({ where: { id } });
    revalidateCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error("[CATEGORIES] delete error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
