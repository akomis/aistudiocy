import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCartSession, setCartSession, clearCartSession } from '@/lib/session'
import { logger } from '@/lib/logger'

// GET /api/store/carts - Retrieve cart from session
export async function GET() {
  const log = logger.scope({ operation: 'cart.retrieve', endpoint: '/api/store/carts' })

  try {
    const cartId = await getCartSession()

    if (!cartId) {
      log.debug('No cart session found')
      return NextResponse.json({ error: 'No cart session' }, { status: 404 })
    }

    log.debug('Retrieving cart', { cartId })

    const payload = await getPayloadClient()

    let cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    })

    // Check for sold out items and remove them from the cart
    if (cart.items && cart.items.length > 0) {
      const unavailableIndices: number[] = []

      cart.items.forEach((item, index) => {
        const product = typeof item.product === 'object' ? item.product : null
        if (product && (product.inventory ?? 1) === 0) {
          unavailableIndices.push(index)
          log.info('Removing sold out item from cart', {
            cartId,
            productId: String(product.id),
            productTitle: product.title,
          })
        }
      })

      if (unavailableIndices.length > 0) {
        // Filter out unavailable items (keeping items whose index is NOT in unavailableIndices)
        const updatedItems = cart.items
          .filter((_, index) => !unavailableIndices.includes(index))
          .map((item) => ({
            product: typeof item.product === 'object' ? item.product.id : item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))

        // Update cart with filtered items (this will trigger recalculation via beforeChange hook)
        cart = await payload.update({
          collection: 'carts',
          id: cartId,
          data: { items: updatedItems },
          depth: 2,
        })

        log.info('Removed sold out items from cart', {
          cartId,
          removedCount: unavailableIndices.length,
        })
      }
    }

    log.debug('Cart retrieved successfully', { cartId })

    return NextResponse.json({ cart })
  } catch (error) {
    log.error('Failed to fetch cart', {}, error)
    // Clear invalid session
    await clearCartSession()
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
  }
}

// POST /api/store/carts - Create new cart and set session
export async function POST() {
  const log = logger.scope({ operation: 'cart.create', endpoint: '/api/store/carts' })

  try {
    log.debug('Creating new cart')

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

    log.info('Cart created successfully', { cartId: String(cart.id) })

    return NextResponse.json({ cart })
  } catch (error) {
    log.error('Failed to create cart', {}, error)
    return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 })
  }
}

// PATCH /api/store/carts - Update cart
export async function PATCH(request: NextRequest) {
  const log = logger.scope({ operation: 'cart.update', endpoint: '/api/store/carts' })

  try {
    const cartId = await getCartSession()

    if (!cartId) {
      log.warn('No cart session for update')
      return NextResponse.json({ error: 'No cart session' }, { status: 401 })
    }

    log.debug('Updating cart', { cartId })

    const payload = await getPayloadClient()
    const data = await request.json()

    const cart = await payload.update({
      collection: 'carts',
      id: cartId,
      data,
      depth: 2,
    })

    log.debug('Cart updated successfully', { cartId })

    return NextResponse.json({ cart })
  } catch (error) {
    log.error('Failed to update cart', {}, error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

// DELETE /api/store/carts - Clear cart session
export async function DELETE() {
  const log = logger.scope({ operation: 'cart.delete', endpoint: '/api/store/carts' })

  try {
    log.debug('Clearing cart session')
    await clearCartSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Failed to clear cart session', {}, error)
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
  }
}
