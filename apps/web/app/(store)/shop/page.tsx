import { Suspense } from "react";
import { getPublishedProducts, getCategories } from "@/actions/productActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ShopFilters } from "@/components/store/ShopFilters";
import { ShopSearchInput } from "@/components/store/ShopSearchInput";

type SearchParams = Promise<{
  category?: string;
  search?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const [productsResult, categoriesResult] = await Promise.all([
    getPublishedProducts({
      categorySlug: params.category,
      search: params.search,
    }),
    getCategories(),
  ]);

  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const categories = categoriesResult.success ? (categoriesResult.data ?? []) : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Shop</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-8">
        <Suspense fallback={null}>
          <ShopSearchInput defaultValue={params.search} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="w-full shrink-0 lg:w-52">
          <ShopFilters
            categories={categories}
            current={{ category: params.category, search: params.search }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </main>
  );
}
