import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCartSession, setCartSession, clearCartSession } from '@/lib/session'

// GET /api/store/carts - Retrieve cart from session
export async function GET() {
  try {
    const cartId = await getCartSession()

    if (!cartId) {
      return NextResponse.json({ error: 'No cart session' }, { status: 404 })
    }

    const payload = await getPayloadClient()

    const cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    })

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error fetching cart:', error)
    // Clear invalid session
    await clearCartSession()
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
  }
}

// POST /api/store/carts - Create new cart and set session
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

    // Set the cart session cookie
    await setCartSession(String(cart.id))

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error creating cart:', error)
    return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 })
  }
}

// PATCH /api/store/carts - Update cart
export async function PATCH(request: NextRequest) {
  try {
    const cartId = await getCartSession()

    if (!cartId) {
      return NextResponse.json({ error: 'No cart session' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    const data = await request.json()

    const cart = await payload.update({
      collection: 'carts',
      id: cartId,
      data,
      depth: 2,
    })

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

// DELETE /api/store/carts - Clear cart session
export async function DELETE() {
  try {
    await clearCartSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart session:', error)
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
  }
}
