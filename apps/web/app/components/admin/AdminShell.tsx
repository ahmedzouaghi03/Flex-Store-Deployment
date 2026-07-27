"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Plus, Store, ClipboardList, MessageSquare, Users } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { LogoImage } from "@/components/store/LogoImage";
import { markAllContactsRead } from "@/actions/contactActions";

export function AdminShell({
  children,
  logoUrl,
  unreadContactsCount = 0,
}: {
  children: React.ReactNode;
  logoUrl?: string | null;
  unreadContactsCount?: number;
}) {
  const pathname = usePathname();

  // admin/layout.tsx (the parent of this component) stays mounted across client-side
  // navigations within /admin/*, so its server-fetched unreadContactsCount prop never
  // refreshes on its own — track it locally and clear it the moment Contacts is opened.
  const [unreadCount, setUnreadCount] = useState(unreadContactsCount);

  useEffect(() => {
    if (!pathname.startsWith("/admin/contacts")) return;
    setUnreadCount(0);
    markAllContactsRead();
  }, [pathname]);

  // Login page — render nothing but the page itself
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white shadow-sm print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <LogoImage height={32} src={logoUrl} />
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

      <div className="mx-auto flex max-w-7xl print:block print:max-w-none">
        {/* sidebar */}
        <aside className="min-h-[calc(100vh-53px)] w-52 shrink-0 border-r border-[var(--color-border)] bg-white print:hidden">
          <nav className="space-y-1 p-4">
            <NavLink href="/admin/orders" active={pathname.startsWith("/admin/orders")}>
              <ClipboardList className="h-4 w-4" />
              Orders
            </NavLink>
            <NavLink href="/admin/products" active={pathname.startsWith("/admin/products") && pathname !== "/admin/products/new"}>
              <ShoppingBag className="h-4 w-4" />
              Products
            </NavLink>
            <NavLink href="/admin/products/new" active={pathname === "/admin/products/new"}>
              <Plus className="h-4 w-4" />
              Add Shoe
            </NavLink>
            <NavLink
              href="/admin/contacts"
              active={pathname.startsWith("/admin/contacts")}
              badge={unreadCount > 0 ? unreadCount : undefined}
            >
              <MessageSquare className="h-4 w-4" />
              Contacts
            </NavLink>
            <NavLink href="/admin/store" active={pathname === "/admin/store"}>
              <Store className="h-4 w-4" />
              Store
            </NavLink>
            <NavLink href="/admin/team" active={pathname.startsWith("/admin/team")}>
              <Users className="h-4 w-4" />
              Team
            </NavLink>
          </nav>
        </aside>

        {/* main */}
        <main className="flex-1 p-8 print:w-full print:p-0">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  active,
  badge,
  children,
}: {
  href: string;
  active: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-[var(--color-green)]/10 text-[var(--color-accent)]"
          : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
      {badge !== undefined && (
        <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
