import { Suspense } from "react";
import { Skeleton } from "@/components/admin/Skeleton";
import { SeoSettingsContent } from "./SeoSettingsContent";

function SeoSettingsSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72" />
          <Skeleton className="mt-3 h-10 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function SeoSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">SEO &amp; Référencement</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manage how your store appears on Google and social media. Changes take effect across
          the whole site as soon as you click <strong>Save Changes</strong>.
        </p>
      </div>

      <Suspense fallback={<SeoSettingsSkeleton />}>
        <SeoSettingsContent />
      </Suspense>
    </div>
  );
}
