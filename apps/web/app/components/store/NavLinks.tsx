"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Store, Info, Mail } from "lucide-react";
import { subdomainHref } from "@/lib/subdomain";

export function NavLinks({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("Nav");

  // Empty until mount so SSR and the first client render match (no host yet);
  // corrected right after via the effect below.
  const [host, setHost] = useState("");
  useEffect(() => setHost(window.location.host), []);

  const LINKS = [
    { path: "/",        href: subdomainHref("/", "www", host),        label: t("Home"),    icon: Home },
    { path: "/shop",    href: subdomainHref("/shop", "shop", host),   label: t("Shop"),    icon: Store },
    { path: "/about",   href: subdomainHref("/about", "www", host),   label: t("About"),   icon: Info },
    { path: "/contact", href: subdomainHref("/contact", "www", host), label: t("Contact"), icon: Mail },
  ];

  if (vertical) {
    return (
      <div className="flex flex-col gap-1">
        {LINKS.map(({ path, href, label, icon: Icon }) => {
          const active =
            path === "/" ? pathname === "/" : pathname.startsWith(path);
          return (
            <Link
              key={path}
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
      {LINKS.map(({ path, href, label, icon: Icon }) => {
        const active =
          path === "/" ? pathname === "/" : pathname.startsWith(path);
        return (
          <Link
            key={path}
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
