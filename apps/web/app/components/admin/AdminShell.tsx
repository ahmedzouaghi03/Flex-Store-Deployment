"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Plus,
  Store,
  ClipboardList,
  Users,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { LogoImage } from "@/components/store/LogoImage";

export function AdminShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string | null;
}) {
  const pathname = usePathname();

  // Login page — render nothing but the page itself
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <LogoImage height={32} />
            </Link>
            <span className="text-[var(--color-border)]">|</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            >
              ← View Store
            </Link>
            <span className="text-[var(--color-border)]">|</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* sidebar */}
        <aside className="min-h-[calc(100vh-53px)] w-52 shrink-0 border-r border-[var(--color-border)] bg-white">
          <nav className="space-y-1 p-4">
            <NavLink
              href="/admin/products"
              active={pathname.startsWith("/admin/products")}
            >
              <ShoppingBag className="h-4 w-4" />
              Products
            </NavLink>
            <NavLink
              href="/admin/products/new"
              active={pathname === "/admin/products/new"}
            >
              <Plus className="h-4 w-4" />
              Add Shoe
            </NavLink>
            <NavLink href="/admin/store" active={pathname === "/admin/store"}>
              <Store className="h-4 w-4" />
              Store
            </NavLink>
            <NavLink
              href="/admin/orders"
              active={pathname.startsWith("/admin/orders")}
            >
              <ClipboardList className="h-4 w-4" />
              Orders
            </NavLink>
            {role === "SUPER_ADMIN" && (
              <NavLink
                href="/admin/team"
                active={pathname.startsWith("/admin/team")}
              >
                <Users className="h-4 w-4" />
                Team
              </NavLink>
            )}
            <NavLink href="/admin" active={pathname === "/admin"}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
          </nav>
        </aside>

        {/* main */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </Link>
  );
}
