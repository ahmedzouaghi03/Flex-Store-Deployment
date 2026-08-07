// Pure, client-safe SEO text generation — used by the "Fill automatically" button
// on the Product and Category admin forms. No server-only imports here (unlike
// app/lib/seo.ts, which pulls in next/headers and can't be used from a Client Component).

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} et ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

export type SeoAutofillInput = {
  name: string;
  description?: string | null;
  categoryName?: string | null;
  colorNames?: string[];
};

export type SeoAutofillResult = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

/**
 * Builds SEO title/description/keywords from real name/description/category/color
 * data — same fallback-safe spirit as the rest of the SEO system: only real facts,
 * nothing fabricated. A real description is used verbatim (truncated); otherwise a
 * short template is built from name + category + colors.
 */
export function generateSeoFields(input: SeoAutofillInput): SeoAutofillResult {
  const name = input.name.trim();
  const categoryName = input.categoryName?.trim() || null;
  const colorNames = (input.colorNames ?? []).map((c) => c.trim()).filter(Boolean);
  const description = input.description?.trim() || null;

  const seoTitle = truncate(categoryName ? `${name} — ${categoryName}` : name, MAX_TITLE_LENGTH);

  let seoDescription: string;
  if (description) {
    seoDescription = truncate(description, MAX_DESCRIPTION_LENGTH);
  } else {
    const bits = [`Découvrez ${name}`];
    if (categoryName) bits.push(`de notre collection ${categoryName}`);
    if (colorNames.length > 0) bits.push(`disponible en ${formatList(colorNames)}`);
    seoDescription = truncate(
      `${bits.join(" ")} — confort et qualité au quotidien, livraison rapide partout en Tunisie.`,
      MAX_DESCRIPTION_LENGTH,
    );
  }

  const seen = new Set<string>();
  const keywords: string[] = [];
  const addKeyword = (v: string | null | undefined) => {
    const t = v?.trim();
    if (!t) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    keywords.push(t);
  };
  addKeyword(name);
  addKeyword(categoryName);
  colorNames.forEach(addKeyword);

  return { seoTitle, seoDescription, seoKeywords: keywords.join(", ") };
}
