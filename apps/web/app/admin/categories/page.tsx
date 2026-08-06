import { Suspense } from "react";
import { Skeleton, CardListSkeleton } from "@/components/admin/Skeleton";
import { CategoriesContent } from "./CategoriesContent";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      {/* header — renders instantly, independent of the DB fetch below */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Categories</h1>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-4 w-56" />
            <CardListSkeleton rows={4} />
          </div>
        }
      >
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
