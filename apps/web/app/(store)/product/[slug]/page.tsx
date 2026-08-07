import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getProductBySlug } from "@/actions/productActions";
import { ProductDetail } from "@/components/store/ProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBaseUrl,
  getApexBaseUrl,
  getSiteIdentity,
  truncate,
  MAX_DESCRIPTION_LENGTH,
  DEFAULT_OG_IMAGE_PATH,
  productJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";

// Deduped across generateMetadata and the page render — same request, one DB query.
const getProduct = cache((slug: string) => getProductBySlug(slug));

function buildDescription(description: string | null, name: string, storeName: string): string {
  const text = description?.trim() || `Shop the ${name} at ${storeName} — light, flexible, and comfortable.`;
  return truncate(text, MAX_DESCRIPTION_LENGTH);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [result, baseUrl, identity] = await Promise.all([getProduct(slug), getBaseUrl(), getSiteIdentity()]);

  if (!result.success || !result.data) {
    return { title: "Product not found" };
  }

  const product = result.data;
  const url = `${baseUrl}/product/${product.slug}`;
  const defaultImage = identity.seo.ogImage ?? `${baseUrl}${DEFAULT_OG_IMAGE_PATH}`;
  const imageUrl = product.ogImage ?? product.primaryImage ?? defaultImage;
  const title = product.seoTitle?.trim() || product.name;
  const description =
    product.seoDescription?.trim() || buildDescription(product.description, product.name, identity.storeName);
  const keywords = product.seoKeywords?.trim() || undefined;

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
      images: [{ url: imageUrl, width: 1200, height: 1200, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [result, baseUrl, apexBaseUrl, identity] = await Promise.all([
    getProduct(slug),
    getBaseUrl(),
    getApexBaseUrl(),
    getSiteIdentity(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;
  const url = `${baseUrl}/product/${product.slug}`;

  const breadcrumbItems = [
    { name: "Home", url: `${apexBaseUrl}/` },
    { name: "Shop", url: `${baseUrl}/` },
    ...(product.category
      ? [{ name: product.category.name, url: `${baseUrl}/shop?category=${product.category.slug}` }]
      : []),
    { name: product.name },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <JsonLd data={productJsonLd({ product, url, storeName: identity.storeName })} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />

      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <ProductDetail
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        basePrice={product.basePrice}
        description={product.description}
        categoryName={product.category?.name}
        colors={product.colors}
        mainImages={product.images.map((i) => i.url)}
      />
    </main>
  );
}
