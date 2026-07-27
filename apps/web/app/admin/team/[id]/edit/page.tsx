import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { Skeleton } from "@/components/admin/Skeleton";
import { TeamMemberEditContent } from "./TeamMemberEditContent";

function EditFormSkeleton() {
  return (
    <div className="space-y-5 rounded-2xl border border-[var(--color-border)] bg-white p-6">
      <Skeleton className="mb-3 h-3 w-64" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (user?.role !== "SUPER_ADMIN") notFound();

  return (
    <div className="max-w-lg">
      <Link
        href="/admin/team"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to team
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">Edit Team Member</h1>

      <Suspense fallback={<EditFormSkeleton />}>
        <TeamMemberEditContent id={id} currentUserId={user.id} />
      </Suspense>
    </div>
  );
}
