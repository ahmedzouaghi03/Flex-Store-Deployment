import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/admin/Skeleton";
import { OrderDetailContent } from "./OrderDetailContent";

type Props = { params: Promise<{ publicId: string }> };

function OrderDetailSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-5 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--color-border)] bg-white p-5 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default async function OrderDetailPage({ params }: Props) {
  const { publicId } = await params;

  return (
    <div className="space-y-6">
      {/* Header — the order number comes straight from the URL, no DB wait needed */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
        >
          <ArrowLeft size={15} />
          Orders
        </Link>
        <span className="text-[var(--color-border)]">/</span>
        <span className="font-mono text-sm font-bold text-[var(--color-text)] break-all">{publicId}</span>
      </div>

      <h1 className="text-2xl font-bold text-[var(--color-text)]">Order {publicId}</h1>

      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetailContent publicId={publicId} />
      </Suspense>
    </div>
  );
}
