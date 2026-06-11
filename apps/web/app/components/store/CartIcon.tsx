"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/cart-context";
import { useTranslations } from "next-intl";

export function CartIcon() {
  const { count, openDrawer } = useCart();
  const t = useTranslations("Nav");

  return (
    <button
      onClick={openDrawer}
      aria-label="Open cart"
      className="relative flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3.5 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
    >
      <ShoppingBag size={16} />
      <span className="hidden sm:block">{t("Cart")}</span>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
