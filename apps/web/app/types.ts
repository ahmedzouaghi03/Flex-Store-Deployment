export type SizeStock = { size: string; stock: number };

export type CartItem = {
  id: string;           // productId-size-colorName
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  priceCents: number;
  size: string | null;
  colorName: string | null;
  colorHex: string | null;
  quantity: number;
};

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  imageUrl: string | null;
  brandName: string | null;
  gender: string;
  isFeatured: boolean;
};

export type ColorImage = {
  name: string;
  hex: string;         // actual color value, e.g. "#1a1a1a"
  imageUrls: string[];
};

export type ProductDetail = ProductListItem & {
  description: string | null;
  images: string[];
  colorImages: ColorImage[];
  sizeStocks: SizeStock[];
  categories: string[];
};

export type ProductInput = {
  name: string;
  priceCents: number;
  images: string[];
  sizeStocks: SizeStock[];
  colorImages: ColorImage[];
  isPublished: boolean;
  isFeatured: boolean;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  images: string[];
  sizeStocks: SizeStock[];
  colorImages: ColorImage[];
  isPublished: boolean;
  isFeatured: boolean;
};
