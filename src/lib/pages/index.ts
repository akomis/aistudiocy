// Static pages (terms, privacy, shipping, guides), one set per locale.
//
// Long-form legal prose lives here rather than in messages/*.json: it is
// document content, not UI copy, and the wording is supplied by counsel.

import type { Locale } from "@/i18n/routing";
import { en } from "./en";
import { el } from "./el";

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
export function getPages(locale: Locale): PageData[] {
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
