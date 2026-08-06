// ─── Admin backward-compat types (admin pages still use these) ───────────────

export type SizeStock = { size: string; stock: number };

export interface UploadResponse {
  ufsUrl: string;
  url: string;
}

export type ColorImage = {
  name: string;
  hex: string;
  imageUrls: string[];
  sizes: SizeStock[];  // per-color stock per size
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  images: string[];        // main product photos (product-level)
  colorImages: ColorImage[];
  isPublished: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  categoryName: string | null;
};

export type ProductInput = {
  name: string;
  priceCents: number;
  images: string[];        // main product photos
  colorImages: ColorImage[];  // each color owns its sizes+stock
  isPublished: boolean;
  isFeatured: boolean;
  categoryId: string | null;
};

// ─── Category types ───────────────────────────────────────────────────────────

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
};

// ─── Shared action result ─────────────────────────────────────────────────────

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
  address?: string | null;
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export type CartItem = {
  id: string;         // === variantId for backward compat
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  unitPrice: number;  // TND
  colorName: string | null;
  colorHex: string | null;
  size: string | null;
  quantity: number;
  maxStock?: number;
};

// ─── Serialized product types (Decimal → number) ─────────────────────────────

export type SerializedProductColorImage = {
  id: string;
  url: string;
  alt: string | null;
  order: number;
};

export type SerializedProductColorSize = {
  id: string;
  size: string;
  stock: number;
  priceOverride: number | null;
};

export type SerializedProductColor = {
  id: string;
  name: string;
  hex: string | null;
  isActive: boolean;
  images: SerializedProductColorImage[];
  sizes: SerializedProductColorSize[];
};

export type SerializedProductImage = {
  id: string;
  url: string;
  alt: string | null;
  order: number;
};

export type SerializedProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  primaryImage: string | null;  // first main image, for cards
  images: SerializedProductImage[];  // all main product images
  isPublished: boolean;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string } | null;
  colors: SerializedProductColor[];
  createdAt: string;
  updatedAt: string;
};

// ─── Order types ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type DiscountType = "PERCENTAGE" | "FIXED";

export type SerializedOrderItem = {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  colorName: string;
  size: string;
  productImage: string | null;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
};

export type SerializedOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  city: string | null;
  subtotal: number;
  shippingCost: number;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  total: number;
  status: string;
  notes: string | null;
  userId: string | null;
  items: SerializedOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrdersPage = {
  orders: SerializedOrder[];
  totalCount: number;
};

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  city?: string;
  items: { variantId: string; quantity: number }[];
};

export type OrderStatistics = {
  total: number;
  totalRevenue: number;
  byStatus: Partial<Record<string, number>>;
};

// ─── Store settings types ─────────────────────────────────────────────────────

export type HeroText = {
  badge: string;
  line1: string;
  line2: string;
  line3: string;
  subtitle: string;
  cta1: string;
  cta2: string;
};

export type VideoText = { label: string; title: string; desc: string };

export const DEFAULT_VIDEO: VideoText = {
  label: "Our Story",
  title: "Comfort that moves with you",
  desc: "See how Flex Comfort Shoes are crafted for every step of your day.",
};

export type CollectionText = { label: string; title: string; desc: string };

export const DEFAULT_COLLECTION: CollectionText = {
  label: "Collection",
  title: "Featured Shoes",
  desc: "Hand-picked pairs from our collection",
};

export type FooterCtaText = { title: string; desc: string; btn: string };

export const DEFAULT_FOOTER_CTA: FooterCtaText = {
  title: "Find your perfect pair.",
  desc: "Browse our full catalog of comfort shoes for every occasion.",
  btn: "Shop All Shoes",
};

export type UspItem = { label: string; desc: string };

export const DEFAULT_USPS: UspItem[] = [
  { label: "Ultra Light", desc: "Feather-light build" },
  { label: "Flexible", desc: "Moves with your foot" },
  { label: "Responsive", desc: "Instant cushioning" },
  { label: "Premium", desc: "Quality materials" },
];

export const DEFAULT_HERO: HeroText = {
  badge: "New Collection 2025",
  line1: "Léger.",
  line2: "Flexible.",
  line3: "Confortable.",
  subtitle: "Engineered for everyday comfort without compromising on style.",
  cta1: "Shop Collection",
  cta2: "Watch Story",
};

export type StoreUspItem = {
  id: string;
  label: string;
  desc: string;
  order: number;
};

export type SerializedStoreSettings = {
  id: string;
  logoUrl: string | null;
  heroImage: string | null;
  heroBadge: string | null;
  heroLine1: string | null;
  heroLine2: string | null;
  heroLine3: string | null;
  heroSubtitle: string | null;
  heroCta1: string | null;
  heroCta2: string | null;
  heroOverlayCardLabel: string | null;
  heroOverlayCardYear: string | null;
  heroOverlayCardCollection: string | null;
  colorAccent: string | null;
  colorGreenDark: string | null;
  colorGreen: string | null;
  colorGreenMid: string | null;
  colorGreenLight: string | null;
  colorGreenBright: string | null;
  videoUrl: string | null;
  videoSectionLabel: string | null;
  videoSectionTitle: string | null;
  videoSectionDesc: string | null;
  collectionLabel: string | null;
  collectionTitle: string | null;
  collectionDesc: string | null;
  footerCtaTitle: string | null;
  footerCtaDesc: string | null;
  footerCtaBtn: string | null;
  deliveryFee: number;
  contactEmail: string | null;
  contactPhone: string | null;
  contactLocation: string | null;
  contactResponseTime: string | null;
  usps: StoreUspItem[];
};

export type ContactInfo = {
  email: string;
  phone: string;
  location: string;
  responseTime: string;
};
