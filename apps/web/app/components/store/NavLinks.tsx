"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Store, Info, Mail } from "lucide-react";

export function NavLinks({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("Nav");

  const LINKS = [
    { href: "/",         label: t("Home"),    icon: Home },
    { href: "/shop",     label: t("Shop"),    icon: Store },
    { href: "/about",   label: t("About"),   icon: Info },
    { href: "/contact", label: t("Contact"), icon: Mail },
  ];

  if (vertical) {
    return (
      <div className="flex flex-col gap-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                active
                  ? "bg-[var(--color-bg)] text-[var(--color-text)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-[var(--color-bg)] p-1 border border-[var(--color-border)]">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
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
