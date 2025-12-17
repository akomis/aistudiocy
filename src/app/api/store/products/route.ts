import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { logger } from '@/lib/logger'
import type { Where } from 'payload'

export async function GET(request: NextRequest) {
  const log = logger.scope({ operation: 'products.list', endpoint: '/api/store/products' })

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')

    log.debug('Fetching products', { categoryId: categoryId || 'all' })

    const payload = await getPayloadClient()

    const where: Where = {
      status: { equals: 'published' },
    }

    if (categoryId) {
      where.category = { equals: categoryId }
    }

    const products = await payload.find({
      collection: 'products',
      where,
      depth: 2,
      sort: '_order',
      limit: 100,
    })

    log.debug('Products fetched successfully', { count: products.docs.length, categoryId: categoryId || 'all' })

    return NextResponse.json({ products: products.docs })
  } catch (error) {
    log.error('Failed to fetch products', {}, error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
