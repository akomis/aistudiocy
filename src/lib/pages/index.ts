// Static pages (terms, privacy, shipping, guides), one set per locale.
//
// Long-form legal prose lives here rather than in the components: it is
// document content, not UI copy, and the wording is supplied by counsel.
//
// The site UI is English-only. These pages are the one exception - consumer
// law in CY/GR expects the terms to be readable in Greek - so they are served
// at `/<slug>` (English) and `/el/<slug>` (Greek).

import { en } from "./en";
import { el } from "./el";

export const LOCALES = ["en", "el"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export type PageData = {
  slug: string;
  title: string;
  subtitle?: string;
  content: string; // Plain text, rendered with `whitespace-pre-line`
  /** Public path of the signed source document, when one exists. */
  pdfHref?: string;
  image?: {
    src: string;
    alt?: string;
  };
};

const pagesByLocale: Record<Locale, PageData[]> = { en, el };

/** Slug order here drives the order of the footer links. */
export function getPages(locale: Locale = DEFAULT_LOCALE): PageData[] {
  return pagesByLocale[locale] ?? pagesByLocale.en;
}

export function getPageBySlug(
  locale: Locale,
  slug: string,
): PageData | undefined {
  return getPages(locale).find((page) => page.slug === slug);
}

/** Slugs are identical across locales, so the English set is authoritative. */
export function getAllPageSlugs(): string[] {
  return en.map((page) => page.slug);
}

/** Public path of a static page in the given locale. */
export function pagePath(locale: Locale, slug: string): string {
  return locale === DEFAULT_LOCALE ? `/${slug}` : `/${locale}/${slug}`;
}
