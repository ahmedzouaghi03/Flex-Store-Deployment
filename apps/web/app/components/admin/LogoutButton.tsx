"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logout } from "@/actions/authActions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-red-600 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
