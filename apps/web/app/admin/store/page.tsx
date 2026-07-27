import { Suspense } from "react";
import { Skeleton } from "@/components/admin/Skeleton";
import { StoreSettingsContent } from "./StoreSettingsContent";

function StoreSettingsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-16 w-full rounded-2xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="mt-3 h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

export default function StoreSettingsPage() {
  return (
    <div>
      {/* header — renders instantly, independent of the DB fetch below */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Store Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Edit your store&apos;s content, colors, and media. The preview on the right
          updates live as you type — click <strong>Save Changes</strong> to publish.
        </p>
      </div>

      <Suspense fallback={<StoreSettingsSkeleton />}>
        <StoreSettingsContent />
      </Suspense>
    </div>
  );
}
