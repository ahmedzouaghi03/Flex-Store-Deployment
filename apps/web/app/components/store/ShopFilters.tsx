import Link from "next/link";

type ShopFiltersProps = {
  brands: { name: string; slug: string }[];
  categories: { name: string; slug: string }[];
  genders: string[];
  current: {
    gender?: string;
    brand?: string;
    category?: string;
    search?: string;
  };
};

function buildShopUrl(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `/shop?${s}` : "/shop";
}

export function ShopFilters({
  brands,
  categories,
  genders,
  current,
}: ShopFiltersProps) {
  const linkClass = (active: boolean) =>
    [
      "block rounded-lg px-3 py-2 text-sm transition",
      active
        ? "bg-[var(--color-accent)] font-semibold text-white"
        : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]",
    ].join(" ");

  return (
    <aside className="space-y-6">
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Gender
        </h2>
        <div className="space-y-0.5">
          <Link
            href={buildShopUrl({
              brand: current.brand,
              category: current.category,
              search: current.search,
            })}
            className={linkClass(!current.gender)}
          >
            All
          </Link>
          {genders.map((g) => (
            <Link
              key={g}
              href={buildShopUrl({
                gender: g,
                brand: current.brand,
                category: current.category,
                search: current.search,
              })}
              className={linkClass(current.gender === g)}
            >
              {g.charAt(0) + g.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Brand
        </h2>
        <div className="space-y-0.5">
          <Link
            href={buildShopUrl({
              gender: current.gender,
              category: current.category,
              search: current.search,
            })}
            className={linkClass(!current.brand)}
          >
            All brands
          </Link>
          {brands.map((b) => (
            <Link
              key={b.slug}
              href={buildShopUrl({
                gender: current.gender,
                brand: b.slug,
                category: current.category,
                search: current.search,
              })}
              className={linkClass(current.brand === b.slug)}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Category
        </h2>
        <div className="space-y-0.5">
          <Link
            href={buildShopUrl({
              gender: current.gender,
              brand: current.brand,
              search: current.search,
            })}
            className={linkClass(!current.category)}
          >
            All categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={buildShopUrl({
                gender: current.gender,
                brand: current.brand,
                category: c.slug,
                search: current.search,
              })}
              className={linkClass(current.category === c.slug)}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
