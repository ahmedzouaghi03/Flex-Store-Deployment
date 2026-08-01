import "./globals.css";
import type { Metadata } from "next";
import { DEFAULT_COLORS } from "@/lib/store-config";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { CartProvider } from "@/cart-context";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Flex Comfort Shoes",
  description: "Léger. Flexible. Confortable.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsResult = await getStoreSettings();
  const settings = settingsResult.success ? settingsResult.data : null;
  const colors = {
    accent: settings?.colorAccent ?? DEFAULT_COLORS.accent,
    "green-dark": settings?.colorGreenDark ?? DEFAULT_COLORS["green-dark"],
    green: settings?.colorGreen ?? DEFAULT_COLORS.green,
    "green-mid": settings?.colorGreenMid ?? DEFAULT_COLORS["green-mid"],
    "green-light": settings?.colorGreenLight ?? DEFAULT_COLORS["green-light"],
    "green-bright": settings?.colorGreenBright ?? DEFAULT_COLORS["green-bright"],
  };
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body
        className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased"
        style={
          {
            "--color-accent": colors.accent,
            "--color-green-dark": colors["green-dark"],
            "--color-green": colors.green,
            "--color-green-mid": colors["green-mid"],
            "--color-green-light": colors["green-light"],
            "--color-green-bright": colors["green-bright"],
          } as React.CSSProperties
        }
      >
        <NextIntlClientProvider>
          <CartProvider>{children}</CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
