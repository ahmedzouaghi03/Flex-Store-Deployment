"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Store, Info, Mail } from "lucide-react";
import { subdomainHref } from "@/lib/subdomain";

export function NavLinks({ vertical = false, host = "" }: { vertical?: boolean; host?: string }) {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  // The shop subdomain's root ("/") is rewritten to /shop server-side, so the
  // browser-visible pathname stays "/" there — pathname alone can't tell Home
  // and Shop apart on that host, hence the explicit onShop checks below.
  const onShop = host.startsWith("shop.");

  const LINKS = [
    {
      key: "home",
      href: subdomainHref("/", "www", host),
      label: t("Home"),
      icon: Home,
      active: !onShop && pathname === "/",
    },
    {
      key: "shop",
      href: subdomainHref("/", "shop", host),
      label: t("Shop"),
      icon: Store,
      active: pathname.startsWith("/shop") || (onShop && pathname === "/"),
    },
    {
      key: "about",
      href: subdomainHref("/about", "www", host),
      label: t("About"),
      icon: Info,
      active: pathname.startsWith("/about"),
    },
    {
      key: "contact",
      href: subdomainHref("/contact", "www", host),
      label: t("Contact"),
      icon: Mail,
      active: pathname.startsWith("/contact"),
    },
  ];

  if (vertical) {
    return (
      <div className="flex flex-col gap-1">
        {LINKS.map(({ key, href, label, icon: Icon, active }) => {
          return (
            <Link
              key={key}
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
      {LINKS.map(({ key, href, label, icon: Icon, active }) => {
        return (
          <Link
            key={key}
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
