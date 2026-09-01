import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getTranslations } from "next-intl/server"
import { getPageBySlug, getAllPageSlugs } from "@/lib/pages"
import { routing, type Locale } from "@/i18n/routing"
import BackButton from "@/components/BackButton"
import LocaleSwitcher from "@/components/LocaleSwitcher"
import Section from "@/components/Section"
import PageImage from "@/components/PageImage"

type Props = {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllPageSlugs().map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const page = getPageBySlug(locale, slug)

  if (!page) return {}

  return {
    title: `${page.title} | φως`,
    description: page.subtitle || page.title,
  }
}

export default async function StaticPage({ params }: Props) {
  const { locale, slug } = await params

  setRequestLocale(locale)

  const page = getPageBySlug(locale, slug)

  if (!page) {
    notFound()
  }

  const t = await getTranslations("Legal")

  return (
    <Section className="min-h-screen animate-in fade-in">
      <div className="max-w-3xl mx-auto px-6 py-12 sm:px-10 sm:py-20">
        <div className="flex items-center justify-between gap-4">
          <BackButton />
          <LocaleSwitcher className="text-sm tracking-wide" />
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
              {t("downloadPdf")}
            </a>
          )}
        </header>

        <article className="prose prose-invert max-w-none leading-7 text-justify whitespace-pre-line">
          {page.content}
        </article>

        {page.image && (
          <PageImage src={page.image.src} alt={page.image.alt} />
        )}
      </div>
    </Section>
  )
}
