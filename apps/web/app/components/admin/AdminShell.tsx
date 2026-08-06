"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Plus, Store, ClipboardList, MessageSquare, Users, Menu, X, Tag } from "lucide-react";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!pathname.startsWith("/admin/contacts")) return;
    setUnreadCount(0);
    markAllContactsRead();
  }, [pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Login page — render nothing but the page itself
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    {
      href: "/admin/orders",
      active: pathname.startsWith("/admin/orders"),
      icon: ClipboardList,
      label: "Orders",
    },
    {
      href: "/admin/products",
      active: pathname.startsWith("/admin/products") && pathname !== "/admin/products/new",
      icon: ShoppingBag,
      label: "Products",
    },
    {
      href: "/admin/products/new",
      active: pathname === "/admin/products/new",
      icon: Plus,
      label: "Add Shoe",
    },
    {
      href: "/admin/categories",
      active: pathname.startsWith("/admin/categories"),
      icon: Tag,
      label: "Categories",
    },
    {
      href: "/admin/contacts",
      active: pathname.startsWith("/admin/contacts"),
      icon: MessageSquare,
      label: "Contacts",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      href: "/admin/store",
      active: pathname === "/admin/store",
      icon: Store,
      label: "Store",
    },
    {
      href: "/admin/team",
      active: pathname.startsWith("/admin/team"),
      icon: Users,
      label: "Team",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white shadow-sm print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2">
              <LogoImage height={32} src={logoUrl} />
            </Link>
            <span className="hidden text-[var(--color-border)] sm:inline">|</span>
            <span className="hidden text-sm font-semibold text-[var(--color-text)] sm:inline">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            >
              ← View Store
            </Link>
            <span className="text-[var(--color-border)]">|</span>
            <LogoutButton />
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] lg:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* mobile/tablet nav — sidebar is desktop-only */}
        {mobileNavOpen && (
          <nav className="space-y-1 border-t border-[var(--color-border)] bg-white p-4 lg:hidden">
            {navItems.map(({ href, active, icon: Icon, label, badge }) => (
              <NavLink key={href} href={href} active={active} badge={badge}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-7xl print:block print:max-w-none">
        {/* sidebar */}
        <aside className="hidden min-h-[calc(100vh-53px)] w-52 shrink-0 border-r border-[var(--color-border)] bg-white print:hidden lg:block">
          <nav className="space-y-1 p-4">
            {navItems.map(({ href, active, icon: Icon, label, badge }) => (
              <NavLink key={href} href={href} active={active} badge={badge}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* main */}
        <main className="flex-1 p-4 print:w-full print:p-0 sm:p-6 lg:p-8">{children}</main>
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
      className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${
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
