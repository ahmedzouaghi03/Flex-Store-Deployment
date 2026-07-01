import Link from "next/link";
import { Plus, Trash2, Eye, EyeOff, Star, Pencil } from "lucide-react";

import {
  getAdminProducts,
  deleteProduct,
  toggleProductPublished,
  toggleProductFeatured,
} from "@/actions/adminActions";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const result = await getAdminProducts();
  const products = result.success ? (result.data ?? []) : [];

  return (
    <div>
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Products</h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            {products.length} shoe{products.length === 1 ? "" : "s"} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-green-mid)]"
        >
          <Plus className="h-4 w-4" />
          Add Shoe
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
            <svg className="h-8 w-8 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="font-semibold text-[var(--color-text)]">No shoes yet</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Add your first shoe to get started.</p>
          <Link
            href="/admin/products/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Add Shoe
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Shoe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Colors</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {products.map((product) => (
                <tr key={product.id} className="transition hover:bg-[var(--color-bg)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 rounded-xl border border-[var(--color-border)] object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]" />
                      )}
                      <span className="font-semibold text-[var(--color-text)]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                    {formatPrice(product.priceCents / 100)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {product.colorImages.slice(0, 4).map((c, i) =>
                        c.imageUrls[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={c.imageUrls[0]}
                            alt={c.name}
                            title={c.name}
                            className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-sm"
                          />
                        ) : (
                          <span
                            key={i}
                            title={c.name}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] text-[9px] font-bold text-[var(--color-muted)]"
                            style={{ backgroundColor: c.hex }}
                          />
                        ),
                      )}
                      {product.colorImages.length > 4 && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[9px] font-bold text-[var(--color-muted)]">
                          +{product.colorImages.length - 4}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          product.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.isPublished ? "Published" : "Draft"}
                      </span>
                      {product.isFeatured && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <Link
                        href={`/admin/products/${product.slug}/edit`}
                        title="Edit shoe"
                        className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-accent)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      {/* Toggle published */}
                      <form
                        action={async () => {
                          "use server";
                          await toggleProductPublished(product.id, !product.isPublished);
                        }}
                      >
                        <button
                          type="submit"
                          title={product.isPublished ? "Unpublish" : "Publish"}
                          className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                        >
                          {product.isPublished ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </form>

                      {/* Toggle featured */}
                      <form
                        action={async () => {
                          "use server";
                          await toggleProductFeatured(product.id, !product.isFeatured);
                        }}
                      >
                        <button
                          type="submit"
                          title={product.isFeatured ? "Remove from featured" : "Mark as featured"}
                          className={`rounded-lg p-1.5 transition hover:bg-[var(--color-bg)] ${
                            product.isFeatured
                              ? "text-amber-500 hover:text-amber-600"
                              : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                          }`}
                        >
                          <Star
                            className="h-4 w-4"
                            fill={product.isFeatured ? "currentColor" : "none"}
                          />
                        </button>
                      </form>

                      {/* Delete */}
                      <form
                        action={async () => {
                          "use server";
                          await deleteProduct(product.id);
                        }}
                      >
                        <button
                          type="submit"
                          title="Delete shoe"
                          className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
