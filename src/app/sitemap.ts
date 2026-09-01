import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { getAllPageSlugs } from '@/lib/pages'
import { routing, type Locale } from '@/i18n/routing'

const BASE_URL = 'https://www.fosjewels.com'

// `localePrefix: "as-needed"` - the default locale has no prefix.
const localePath = (locale: Locale) =>
  locale === routing.defaultLocale ? '' : `/${locale}`

const url = (locale: Locale, path: string) =>
  `${BASE_URL}${localePath(locale)}${path}`

/**
 * One entry per locale, each carrying the full set of hreflang alternates so
 * search engines can pair the translations.
 */
const localizedEntries = (
  path: string,
  rest: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>,
): MetadataRoute.Sitemap =>
  routing.locales.map((locale) => ({
    ...rest,
    url: url(locale, path),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((alternate) => [alternate, url(alternate, path)]),
      ),
    },
  }))

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()

  // Get all published products
  const products = await payload.find({
    collection: 'products',
    where: {
      status: { equals: 'published' },
    },
    limit: 1000,
    select: {
      handle: true,
      updatedAt: true,
    },
  })

  // Get all categories
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    select: {
      handle: true,
      updatedAt: true,
    },
  })

  // Static pages from lib/pages
  const staticPageSlugs = getAllPageSlugs()

  // Core pages
  const corePages: MetadataRoute.Sitemap = [
    ...localizedEntries('/', {
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }),
    ...localizedEntries('/catalogue', {
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }),
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.docs.flatMap(
    (category) =>
      localizedEntries(`/catalogue?category=${category.handle}`, {
        lastModified: category.updatedAt
          ? new Date(category.updatedAt)
          : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }),
  )

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.docs.flatMap((product) =>
    localizedEntries(`/catalogue/${product.handle}`, {
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }),
  )

  // Static content pages
  const staticPages: MetadataRoute.Sitemap = staticPageSlugs.flatMap((slug) =>
    localizedEntries(`/${slug}`, {
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }),
  )

  return [...corePages, ...categoryPages, ...productPages, ...staticPages]
}
