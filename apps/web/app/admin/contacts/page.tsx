import { Suspense } from "react";
import { Skeleton, CardListSkeleton } from "@/components/admin/Skeleton";
import { ContactsContent } from "./ContactsContent";

export default function AdminContactsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Contact Messages</h1>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-4 w-32" />
            <CardListSkeleton rows={5} />
          </div>
        }
      >
        <ContactsContent />
      </Suspense>
    </div>
  );
}
