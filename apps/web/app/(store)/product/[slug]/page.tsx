import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getProductBySlug } from "@/actions/productActions";
import { ProductDetail } from "@/components/store/ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <ProductDetail
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        basePrice={product.basePrice}
        description={product.description}
        categoryName={product.category?.name}
        colors={product.colors}
        mainImages={product.images.map((i) => i.url)}
      />
    </main>
  );
}
