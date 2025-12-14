import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import type { Where } from 'payload'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')

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

    return NextResponse.json({ products: products.docs })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
