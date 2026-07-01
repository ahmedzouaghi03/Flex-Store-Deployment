import { getPublishedProducts, getCategories } from "@/actions/productActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ShopFilters } from "@/components/store/ShopFilters";

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

      <form className="mb-8" action="/shop" method="get">
        {params.category && <input type="hidden" name="category" value={params.category} />}
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
