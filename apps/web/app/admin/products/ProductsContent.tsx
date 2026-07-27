import { getAdminProducts } from "@/actions/adminActions";
import { ProductsTable } from "@/components/admin/ProductsTable";

export async function ProductsContent() {
  const result = await getAdminProducts();
  const products = result.success ? (result.data ?? []) : [];

  return (
    <>
      <p className="mt-0.5 text-sm text-[var(--color-muted)]">
        {products.length} shoe{products.length === 1 ? "" : "s"} total
      </p>
      <div className="mt-6">
        <ProductsTable products={products} />
      </div>
    </>
  );
}
