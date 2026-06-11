import type { Gender } from "@shoestore/db";

import {
  getPublishedProducts,
  getShopFilters,
} from "@/actions/productActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ShopFilters } from "@/components/store/ShopFilters";

type SearchParams = Promise<{
  gender?: string;
  brand?: string;
  category?: string;
  search?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const gender = params.gender as Gender | undefined;

  const [productsResult, filtersResult] = await Promise.all([
    getPublishedProducts({
      gender,
      brandSlug: params.brand,
      categorySlug: params.category,
      search: params.search,
    }),
    getShopFilters(),
  ]);

  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const filters = (filtersResult.success && filtersResult.data)
    ? filtersResult.data
    : { brands: [], categories: [], genders: [] as Gender[] };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Shop</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </div>

      <form className="mb-8" action="/shop" method="get">
        <input type="hidden" name="gender" value={params.gender ?? ""} />
        <input type="hidden" name="brand" value={params.brand ?? ""} />
        <input type="hidden" name="category" value={params.category ?? ""} />
        <input
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Search shoes..."
          className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
      </form>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="w-full shrink-0 lg:w-52">
          <ShopFilters
            brands={filters.brands}
            categories={filters.categories}
            genders={filters.genders}
            current={{
              gender: params.gender,
              brand: params.brand,
              category: params.category,
              search: params.search,
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </main>
  );
}
