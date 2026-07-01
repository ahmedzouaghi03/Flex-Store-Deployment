import { ProductCard } from "./ProductCard";
import type { SerializedProduct } from "@/types";

export function ProductGrid({ products }: { products: SerializedProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
        <p className="text-[var(--color-muted)]">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
