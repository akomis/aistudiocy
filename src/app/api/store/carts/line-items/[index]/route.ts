import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCartSession } from '@/lib/session'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ index: string }> },
) {
  try {
    const cartId = await getCartSession()

    if (!cartId) {
      return NextResponse.json({ error: 'No cart session' }, { status: 401 })
    }

    const { index } = await params
    const itemIndex = parseInt(index, 10)
    const payload = await getPayloadClient()

    const cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 0,
    })

    const items = cart.items || []
    if (itemIndex < 0 || itemIndex >= items.length) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const updatedItems = items.filter((_: unknown, i: number) => i !== itemIndex)

    const updatedCart = await payload.update({
      collection: 'carts',
      id: cartId,
      data: { items: updatedItems },
      depth: 2,
    })

    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    console.error('Error removing line item:', error)
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
  }
}
