import { notFound } from "next/navigation"
import { getPageBySlug, getAllPageSlugs } from "@/lib/pages"
import HomeButton from "@/components/HomeButton"
import Section from "@/components/Section"
import PageImage from "@/components/PageImage"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPageSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = getPageBySlug(slug)

  if (!page) return {}

  return {
    title: `${page.title} | φως`,
    description: page.subtitle || page.title,
  }
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params
  const page = getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return (
    <Section className="min-h-screen animate-in fade-in">
      <div className="max-w-3xl mx-auto px-6 py-12 sm:px-10 sm:py-20">
        <HomeButton isIcon />

        <header className="mt-12 mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{page.title}</h1>
          {page.subtitle && (
            <p className="text-lg text-muted-foreground">{page.subtitle}</p>
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
