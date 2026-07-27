"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { login } from "@/actions/authActions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        {/* brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="rounded-xl bg-[var(--color-green)] px-3 py-1.5 text-lg font-black text-white tracking-wide">
              FLEX
            </span>
            <span className="text-base font-semibold text-[var(--color-text)]">
              Admin
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Sign in to manage your store
          </p>
        </div>

        {/* card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg)] ring-1 ring-[var(--color-border)]">
              <Lock className="h-5 w-5 text-[var(--color-accent)]" />
            </div>
          </div>

          <h1 className="mb-6 text-center text-xl font-bold text-[var(--color-text)]">
            Admin Login
          </h1>

          {state?.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60 active:scale-95"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
          Flex Comfort Shoes — Admin Panel
        </p>
      </div>
    </div>
  );
}
