import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getProductBySlug } from "@/actions/productActions";
import { formatPrice } from "@/lib/utils";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductActions } from "@/components/store/ProductActions";

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

      <div className="grid gap-12 lg:grid-cols-2">

        {/* LEFT: interactive gallery */}
        <ProductGallery
          images={product.images}
          colorImages={product.colorImages}
          productName={product.name}
        />

        {/* RIGHT: product info */}
        <div className="flex flex-col">
          {product.brandName ? (
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              {product.brandName}
            </p>
          ) : null}

          <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            {product.priceCents > 0 ? (
              <>
                <span className="text-2xl font-bold text-[var(--color-text)]">
                  {formatPrice(product.priceCents)}
                </span>
                {product.compareAtPriceCents ? (
                  <span className="text-lg text-[var(--color-muted)] line-through">
                    {formatPrice(product.compareAtPriceCents)}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-lg text-[var(--color-muted)]">Price on request</span>
            )}
          </div>

          {product.description ? (
            <p className="mt-5 leading-relaxed text-[var(--color-muted)]">
              {product.description}
            </p>
          ) : null}

          {product.categories.length > 0 && (
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              {product.categories.join(" · ")}
            </p>
          )}

          <div className="mt-8">
            <ProductActions
              productId={product.id}
              slug={product.slug}
              name={product.name}
              priceCents={product.priceCents}
              imageUrl={product.imageUrl}
              sizeStocks={product.sizeStocks}
              colorImages={product.colorImages}
            />
          </div>
        </div>

      </div>
    </main>
  );
}
