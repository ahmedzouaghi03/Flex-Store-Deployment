import { notFound } from "next/navigation";
import { getProductForEdit } from "@/actions/adminActions";
import { getAdminCategories } from "@/actions/categoryActions";
import { ProductForm } from "@/components/admin/ProductForm";

export async function EditProductContent({ slug }: { slug: string }) {
  const [result, categoriesResult] = await Promise.all([
    getProductForEdit(slug),
    getAdminCategories(),
  ]);
  if (!result.success || !result.data) notFound();
  const categories = categoriesResult.success ? (categoriesResult.data ?? []) : [];

  return <ProductForm initialData={result.data} categories={categories} />;
}
