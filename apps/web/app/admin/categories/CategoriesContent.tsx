import { getAdminCategories } from "@/actions/categoryActions";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export async function CategoriesContent() {
  const result = await getAdminCategories();
  const categories = result.success ? (result.data ?? []) : [];

  return <CategoriesClient categories={categories} />;
}
