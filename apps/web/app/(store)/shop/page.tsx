import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedProducts, getCategories, getCategoryBySlug } from "@/actions/productActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ShopFilters } from "@/components/store/ShopFilters";
import { ShopSearchInput } from "@/components/store/ShopSearchInput";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBaseUrl,
  getApexBaseUrl,
  getSiteIdentity,
  truncate,
  MAX_DESCRIPTION_LENGTH,
  DEFAULT_OG_IMAGE_PATH,
  breadcrumbJsonLd,
} from "@/lib/seo";

type SearchParams = Promise<{
  category?: string;
  search?: string;
}>;

const SHOP_DEFAULT_TITLE = "Shop All Shoes";
const SHOP_DEFAULT_DESCRIPTION =
  "Parcourez toute la collection : chaussures confortables, claquettes et produits orthopédiques, avec livraison partout en Tunisie.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const [baseUrl, identity] = await Promise.all([getBaseUrl(), getSiteIdentity()]);
  const defaultImage = identity.seo.ogImage ?? `${baseUrl}${DEFAULT_OG_IMAGE_PATH}`;

  let title = SHOP_DEFAULT_TITLE;
  let description = SHOP_DEFAULT_DESCRIPTION;
  let image = defaultImage;
  let keywords: string | undefined;
  // A pure category filter (no search term) gets its own canonical URL and sitemap entry —
  // matches app/sitemap.ts. Combined with a search term, or an unknown slug, it's a
  // transient filtered view that canonicalizes back to plain /shop.
  let url = `${baseUrl}/shop`;

  if (params.category) {
    const categoryResult = await getCategoryBySlug(params.category);
    const category = categoryResult.success ? categoryResult.data : null;
    if (category) {
      title = category.seoTitle?.trim() || `${category.name} — Shop`;
      description =
        category.seoDescription?.trim() ||
        (category.description ? truncate(category.description, MAX_DESCRIPTION_LENGTH) : SHOP_DEFAULT_DESCRIPTION);
      image = category.ogImage?.trim() || category.image || defaultImage;
      keywords = category.seoKeywords?.trim() || undefined;
      if (!params.search) url = `${baseUrl}/shop?category=${category.slug}`;
    }
  }

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: identity.storeName,
      images: [{ url: image, width: 1200, height: 1200 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const [productsResult, categoriesResult, baseUrl, apexBaseUrl] = await Promise.all([
    getPublishedProducts({
      categorySlug: params.category,
      search: params.search,
    }),
    getCategories(),
    getBaseUrl(),
    getApexBaseUrl(),
  ]);

  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const categories = categoriesResult.success ? (categoriesResult.data ?? []) : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: `${apexBaseUrl}/` },
          { name: "Shop", url: `${baseUrl}/shop` },
        ])}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Shop</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-8">
        <Suspense fallback={null}>
          <ShopSearchInput defaultValue={params.search} />
        </Suspense>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="w-full shrink-0 lg:w-52">
          <ShopFilters
            categories={categories}
            current={{ category: params.category, search: params.search }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </main>
  );
}
