import Link from "next/link";

type ShopFiltersProps = {
  categories: { name: string; slug: string }[];
  current: {
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

export function ShopFilters({ categories, current }: ShopFiltersProps) {
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
          Category
        </h2>
        <div className="space-y-0.5">
          <Link
            href={buildShopUrl({ search: current.search })}
            className={linkClass(!current.category)}
          >
            All categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={buildShopUrl({ category: c.slug, search: current.search })}
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
