import "./globals.css";
import type { Metadata } from "next";
import { getStoreConfig } from "@/lib/store-config";
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
  const { colors } = getStoreConfig();
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
