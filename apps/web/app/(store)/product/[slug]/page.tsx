import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ChevronLeft } from "lucide-react";

import { getProductBySlug } from "@/actions/productActions";
import { ProductDetail } from "@/components/store/ProductDetail";

const STORE_NAME = "Flex Comfort Shoes";
const DEFAULT_OG_IMAGE_PATH = "/icon.png";
const MAX_DESCRIPTION_LENGTH = 160;

// Deduped across generateMetadata and the page render — same request, one DB query.
const getProduct = cache((slug: string) => getProductBySlug(slug));

async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = headersList.get("x-forwarded-proto") ?? (isLocalhost ? "http" : "https");
  return `${protocol}://${host}`;
}

function buildDescription(description: string | null, name: string): string {
  const text = description?.trim() || `Shop the ${name} at ${STORE_NAME} — light, flexible, and comfortable.`;
  return text.length > MAX_DESCRIPTION_LENGTH
    ? `${text.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`
    : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProduct(slug);

  if (!result.success || !result.data) {
    return { title: "Product not found" };
  }

  const product = result.data;
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/product/${product.slug}`;
  const imageUrl = product.primaryImage ?? `${baseUrl}${DEFAULT_OG_IMAGE_PATH}`;
  const description = buildDescription(product.description, product.name);

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url,
      siteName: STORE_NAME,
      images: [{ url: imageUrl, width: 1200, height: 1200, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
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
  const result = await getProduct(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/shop"
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
