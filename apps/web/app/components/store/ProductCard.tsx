import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { SerializedProduct } from "@/types";

export function ProductCard({ product }: { product: SerializedProduct }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition hover:shadow-md hover:border-[var(--color-green-light)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-bg)]">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
            No image
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        {product.category?.name && (
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {product.category.name}
          </p>
        )}
        <h3 className="mt-1 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-text)]">
            {formatPrice(product.basePrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}
