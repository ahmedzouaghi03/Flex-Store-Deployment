import { Loader2 } from "lucide-react";

export function AdminPageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
    </div>
  );
}
