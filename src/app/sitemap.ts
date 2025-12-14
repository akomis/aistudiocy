import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { getAllPageSlugs } from '@/lib/pages'

const BASE_URL = 'https://www.fosjewels.com'

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

  // Static pages from pages.ts
  const staticPageSlugs = getAllPageSlugs()

  // Core pages
  const corePages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/catalogue`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.docs.map((category) => ({
    url: `${BASE_URL}/catalogue?category=${category.handle}`,
    lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.docs.map((product) => ({
    url: `${BASE_URL}/catalogue/${product.handle}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Static content pages
  const staticPages: MetadataRoute.Sitemap = staticPageSlugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...corePages, ...categoryPages, ...productPages, ...staticPages]
}
