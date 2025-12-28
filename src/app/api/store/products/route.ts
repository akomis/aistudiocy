import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { logger } from '@/lib/logger'
import type { Where } from 'payload'

export async function GET(request: NextRequest) {
  const log = logger.scope({ operation: 'products.list', endpoint: '/api/store/products' })

  try {
    const { searchParams } = new URL(request.url)
    const categoryHandle = searchParams.get('category_handle')

    log.debug('Fetching products', { categoryHandle: categoryHandle || 'all' })

    const payload = await getPayloadClient()

    const where: Where = {
      status: { equals: 'published' },
    }

    if (categoryHandle) {
      // First find the category by handle
      const categoryResult = await payload.find({
        collection: 'categories',
        where: { handle: { equals: categoryHandle } },
        limit: 1,
      })

      if (categoryResult.docs.length === 0) {
        log.debug('Category not found', { categoryHandle })
        return NextResponse.json({ products: [] })
      }

      where.category = { equals: categoryResult.docs[0].id }
    }

    const products = await payload.find({
      collection: 'products',
      where,
      depth: 2,
      sort: '_order',
      limit: 100,
    })

    log.debug('Products fetched successfully', { count: products.docs.length, categoryHandle: categoryHandle || 'all' })

    return NextResponse.json({ products: products.docs })
  } catch (error) {
    log.error('Failed to fetch products', {}, error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
