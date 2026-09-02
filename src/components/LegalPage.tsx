import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import PageImage from "@/components/PageImage";
import Section from "@/components/Section";
import { DEFAULT_LOCALE, getPageBySlug, pagePath, type Locale } from "@/lib/pages";

// The only translated surface left on the site. Each page links to its
// counterpart in the other language - there is no global locale switcher.
const LABELS: Record<Locale, { downloadPdf: string; otherLanguage: string }> = {
  en: { downloadPdf: "DOWNLOAD PDF", otherLanguage: "ΕΛΛΗΝΙΚΑ" },
  el: { downloadPdf: "ΛΗΨΗ PDF", otherLanguage: "ENGLISH" },
};

const OTHER_LOCALE: Record<Locale, Locale> = { en: "el", el: "en" };

export default function LegalPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const page = getPageBySlug(locale, slug);

  if (!page) {
    notFound();
  }

  const labels = LABELS[locale];
  const other = OTHER_LOCALE[locale];

  return (
    <Section className="min-h-screen">
      <div
        className="max-w-3xl mx-auto px-6 py-12 sm:px-10 sm:py-20"
        lang={locale}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Always the landing page: these are footer links, so history
              is rarely where the visitor wants to go. */}
          <BackButton href="/" />
          <Link
            href={pagePath(other, slug)}
            hrefLang={other}
            className="text-sm tracking-wide hover:opacity-70 transition-all duration-500"
          >
            {labels.otherLanguage}
          </Link>
        </div>

        <header className="mt-12 mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{page.title}</h1>
          {page.subtitle && (
            <p className="text-lg text-muted-foreground">{page.subtitle}</p>
          )}
          {page.pdfHref && (
            <a
              href={page.pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm underline underline-offset-4 hover:opacity-70 transition-all"
            >
              {labels.downloadPdf}
            </a>
          )}
        </header>

        <article className="prose prose-invert max-w-none leading-7 text-left whitespace-pre-line">
          {page.content}
        </article>

        {page.image && <PageImage src={page.image.src} alt={page.image.alt} />}
      </div>
    </Section>
  );
}

/** Shared `generateMetadata` body for both locale routes. */
export function legalPageMetadata(locale: Locale, slug: string) {
  const page = getPageBySlug(locale, slug);

  if (!page) return {};

  return {
    title: `${page.title} | φως`,
    description: page.subtitle || page.title,
    alternates: {
      canonical: pagePath(locale, slug),
      languages: {
        en: pagePath(DEFAULT_LOCALE, slug),
        el: pagePath("el", slug),
      },
    },
  };
}
