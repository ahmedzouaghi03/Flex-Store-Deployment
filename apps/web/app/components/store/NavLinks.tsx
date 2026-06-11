"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Store } from "lucide-react";

export function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations("Nav");

  const LINKS = [
    { href: "/",     label: t("Home"), icon: Home },
    { href: "/shop", label: t("Shop"), icon: Store },
  ];

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-[var(--color-bg)] p-1 border border-[var(--color-border)]">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
              active
                ? "bg-white text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/60"
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
