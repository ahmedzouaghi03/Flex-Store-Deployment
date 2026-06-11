import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { getProductForEdit } from "@/actions/adminActions";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProductForEdit(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to products
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Edit Shoe</h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">
        Update the details below and click &quot;Save Changes&quot;.
      </p>
      <ProductForm initialData={result.data} />
    </div>
  );
}
