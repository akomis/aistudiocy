import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCartSession } from '@/lib/session'

// Apply coupon to cart
export async function POST(request: NextRequest) {
  try {
    const cartId = await getCartSession()

    if (!cartId) {
      return NextResponse.json({ error: 'No cart session' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    // Find the coupon by code (case-insensitive)
    const coupons = await payload.find({
      collection: 'coupons',
      where: {
        code: { equals: code.toUpperCase().trim() },
      },
      limit: 1,
    })

    if (coupons.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
    }

    const coupon = coupons.docs[0]

    // Check if coupon is active
    if (coupon.status !== 'active') {
      return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
    }

    // Check if coupon has expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
    }

    // Get current cart to check minimum order amount
    const currentCart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 0,
    })

    if (coupon.minimumOrderAmount && (currentCart.subtotal || 0) < coupon.minimumOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order of ${coupon.minimumOrderAmount}EUR required` },
        { status: 400 },
      )
    }

    // Apply coupon to cart
    const cart = await payload.update({
      collection: 'carts',
      id: cartId,
      data: { coupon: coupon.id },
      depth: 2,
    })

    return NextResponse.json({
      cart,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    })
  } catch (error) {
    console.error('Error applying coupon:', error)
    return NextResponse.json({ error: 'Failed to apply coupon' }, { status: 500 })
  }
}

// Remove coupon from cart
export async function DELETE() {
  try {
    const cartId = await getCartSession()

    if (!cartId) {
      return NextResponse.json({ error: 'No cart session' }, { status: 401 })
    }

    const payload = await getPayloadClient()

    const cart = await payload.update({
      collection: 'carts',
      id: cartId,
      data: { coupon: null },
      depth: 2,
    })

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error removing coupon:', error)
    return NextResponse.json({ error: 'Failed to remove coupon' }, { status: 500 })
  }
}
