import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminCategories } from "@/actions/categoryActions";

export default async function NewProductPage() {
  const result = await getAdminCategories();
  const categories = result.success ? (result.data ?? []) : [];

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to products
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Add New Shoe</h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">
        Fill in the details. The shoe will appear in the store once published.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
