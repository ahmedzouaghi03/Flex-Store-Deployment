import { Suspense } from "react";
import { Skeleton, CardListSkeleton } from "@/components/admin/Skeleton";
import { TeamContent } from "./TeamContent";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      {/* header — renders instantly, independent of the DB fetch below */}
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Team</h1>

      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-4 w-56" />
            <CardListSkeleton rows={4} />
          </div>
        }
      >
        <TeamContent />
      </Suspense>
    </div>
  );
}
