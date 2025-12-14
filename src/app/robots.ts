import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/confirmation'],
      },
    ],
    sitemap: 'https://www.fosjewels.com/sitemap.xml',
  }
}
