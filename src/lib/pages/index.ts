// Static pages (terms, privacy, shipping, guides).
//
// Long-form legal prose lives here rather than in the components: it is
// document content, not UI copy, and the wording is supplied by counsel.
// Each page is one module holding both language versions side by side, so a
// wording change and its translation are edited together.
//
// The site UI is English-only. These pages are the one exception - consumer
// law in CY/GR expects the terms to be readable in Greek - so they are served
// at `/<slug>` (English) and `/el/<slug>` (Greek), both prerendered at build
// time.

import { shipping } from "./shipping";
import { silverCare } from "./silver-care";
import { ringSize } from "./ring-size";
import { terms } from "./terms";
import { privacy } from "./privacy";

export const LOCALES = ["en", "el"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** One language version of a page. */
export type PageContent = {
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

/** A page module: one slug, every language version. */
export type LocalizedPage = { slug: string } & {
  [L in Locale]: PageContent;
};

export type PageData = PageContent & { slug: string };

/** Order here drives the order of the footer links. */
const PAGES: LocalizedPage[] = [shipping, silverCare, ringSize, terms, privacy];

export function getPages(locale: Locale = DEFAULT_LOCALE): PageData[] {
  return PAGES.map((page) => ({ slug: page.slug, ...page[locale] }));
}

export function getPageBySlug(
  locale: Locale,
  slug: string,
): PageData | undefined {
  const page = PAGES.find((candidate) => candidate.slug === slug);

  if (!page) return undefined;

  return { slug: page.slug, ...page[locale] };
}

/** Slugs are shared across locales. */
export function getAllPageSlugs(): string[] {
  return PAGES.map((page) => page.slug);
}

/** Public path of a static page in the given locale. */
export function pagePath(locale: Locale, slug: string): string {
  return locale === DEFAULT_LOCALE ? `/${slug}` : `/${locale}/${slug}`;
}
