import Link from "next/link";
import { UserCircle } from "lucide-react";
import { LogoImage } from "./LogoImage";
import { CartIcon } from "./CartIcon";
import { CartDrawer } from "./CartDrawer";
import { NavLinks } from "./NavLinks";
import { MobileNavMenu } from "./MobileNavMenu";
import { UserMenu } from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";
import { getCurrentUser } from "@/lib/session";
import { getTranslations } from "next-intl/server";
import { getStoreSettings } from "@/actions/storeSettingsActions";

export async function StoreHeader() {
  const [session, settings] = await Promise.all([getCurrentUser(), getStoreSettings()]);
  const t = await getTranslations("Nav");
  const logoUrl = settings.success ? settings.data?.logoUrl ?? null : null;

  return (
    <>
      <CartDrawer />
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[var(--color-border)]">
        {/* Accent line at the very top */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--color-accent)]/40 to-transparent" />

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            <LogoImage height={38} src={logoUrl} />
          </Link>

          {/* Pill nav — center */}
          <div className="hidden sm:flex">
            <NavLinks />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSelector />

            <CartIcon />

            <div className="h-5 w-px bg-[var(--color-border)]" />

            {session ? (
              <UserMenu name={session.name} email={session.email} role={session.role} />
            ) : (
              <Link
                href="/account/login"
                className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-2.5 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 sm:px-3.5"
              >
                <UserCircle size={16} />
                <span className="hidden sm:block">{t("SignIn")}</span>
              </Link>
            )}

            <MobileNavMenu />
          </div>
        </div>
      </header>
    </>
  );
}
