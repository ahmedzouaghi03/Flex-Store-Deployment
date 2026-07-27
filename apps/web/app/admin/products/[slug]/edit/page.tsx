import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Skeleton } from "@/components/admin/Skeleton";
import { EditProductContent } from "./EditProductContent";

function ProductFormSkeleton() {
  return (
    <div className="max-w-2xl space-y-8">
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to products
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Edit Shoe</h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">
        Update the details below and click &quot;Save Changes&quot;.
      </p>

      <Suspense fallback={<ProductFormSkeleton />}>
        <EditProductContent slug={slug} />
      </Suspense>
    </div>
  );
}
