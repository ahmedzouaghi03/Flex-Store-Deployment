"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Package, UserCircle, LogOut, ChevronDown, Loader2, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import { logoutUser } from "@/actions/customerAuthActions";

type Props = { name: string; email: string; role: string };

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500",  "bg-rose-500",  "bg-indigo-500",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export function UserMenu({ name, email, role }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("UserMenu");

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    startTransition(async () => {
      await logoutUser();
      window.location.href = "/";
    });
  }

  const initials = getInitials(name);
  const color = avatarColor(name);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-[var(--color-bg)]"
      >
        <span className="relative">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}>
            {initials}
          </span>
          {ADMIN_ROLES.has(role) && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-accent)] ring-2 ring-white">
              <LayoutDashboard size={8} className="text-white" />
            </span>
          )}
        </span>
        <span className="hidden text-sm font-semibold text-[var(--color-text)] sm:block">
          {name.split(" ")[0]}
        </span>
        <ChevronDown
          size={14}
          className={`text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[var(--color-border)] bg-white shadow-lg overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-sm font-bold text-[var(--color-text)] truncate">{name}</p>
            <p className="text-xs text-[var(--color-muted)] truncate">{email}</p>
          </div>

          {/* Admin shortcut */}
          {ADMIN_ROLES.has(role) && (
            <div className="border-b border-[var(--color-border)] py-1.5">
              <Link
                href="/admin/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition"
              >
                <LayoutDashboard size={15} />
                Admin Dashboard
              </Link>
            </div>
          )}

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition"
            >
              <Package size={15} className="text-[var(--color-muted)]" />
              {t("MyOrders")}
            </Link>
            <Link
              href="/account/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition"
            >
              <UserCircle size={15} className="text-[var(--color-muted)]" />
              {t("MyProfile")}
            </Link>
          </div>

          <div className="border-t border-[var(--color-border)] py-1.5">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-60"
            >
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
              {t("SignOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
