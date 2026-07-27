import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const CONFIG_PATH = join(process.cwd(), "store-config.json");

export type StoreColors = {
  accent: string;
  "green-dark": string;
  green: string;
  "green-mid": string;
  "green-light": string;
  "green-bright": string;
};

export type StoreConfig = {
  hero: {
    badge: string;
    line1: string;
    line2: string;
    line3: string;
    subtitle: string;
    cta1: string;
    cta2: string;
  };
  photoCard: { label: string; year: string };
  usp: { label: string; desc: string }[];
  video: { label: string; title: string; desc: string };
  collection: { label: string; title: string; desc: string };
  footerCta: { title: string; desc: string; btn: string };
  colors: StoreColors;
  deliveryFeeCents: number;
};

export const DEFAULT_CONFIG: StoreConfig = {
  photoCard: { label: "Collection", year: "2025" },
  hero: {
    badge: "New Collection 2025",
    line1: "Léger.",
    line2: "Flexible.",
    line3: "Confortable.",
    subtitle:
      "Engineered for everyday comfort without compromising on style. Discover the Flex Comfort Shoes collection.",
    cta1: "Shop Collection",
    cta2: "Watch Story",
  },
  usp: [
    { label: "Ultra Light", desc: "Feather-light build" },
    { label: "Flexible", desc: "Moves with your foot" },
    { label: "Responsive", desc: "Instant cushioning" },
    { label: "Premium", desc: "Quality materials" },
  ],
  video: {
    label: "Our Story",
    title: "Comfort that moves with you",
    desc: "See how Flex Comfort Shoes are crafted for every step of your day.",
  },
  collection: {
    label: "Collection",
    title: "Featured Shoes",
    desc: "Hand-picked pairs from our collection",
  },
  footerCta: {
    title: "Find your perfect pair.",
    desc: "Browse our full catalog of comfort shoes for every occasion.",
    btn: "Shop All Shoes",
  },
  colors: {
    accent: "#4a7018",
    "green-dark": "#1a3406",
    green: "#4a7018",
    "green-mid": "#5c8c1e",
    "green-light": "#7ab820",
    "green-bright": "#9ed43a",
  },
  deliveryFeeCents: 0,
};

export function getStoreConfig(): StoreConfig {
  try {
    if (!existsSync(CONFIG_PATH)) return DEFAULT_CONFIG;
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreConfig>;
    return {
      hero: { ...DEFAULT_CONFIG.hero, ...parsed.hero },
      photoCard: { ...DEFAULT_CONFIG.photoCard, ...parsed.photoCard },
      usp: parsed.usp ?? DEFAULT_CONFIG.usp,
      video: { ...DEFAULT_CONFIG.video, ...parsed.video },
      collection: { ...DEFAULT_CONFIG.collection, ...parsed.collection },
      footerCta: { ...DEFAULT_CONFIG.footerCta, ...parsed.footerCta },
      colors: { ...DEFAULT_CONFIG.colors, ...parsed.colors },
      deliveryFeeCents: parsed.deliveryFeeCents ?? DEFAULT_CONFIG.deliveryFeeCents,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveStoreConfig(config: StoreConfig): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
