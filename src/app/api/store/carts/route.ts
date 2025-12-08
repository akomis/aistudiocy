import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST() {
  try {
    const payload = await getPayloadClient()

    const cart = await payload.create({
      collection: 'carts',
      data: {
        items: [],
        subtotal: 0,
        shippingTotal: 0,
        total: 0,
      },
    })

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error creating cart:', error)
    return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 })
  }
}
