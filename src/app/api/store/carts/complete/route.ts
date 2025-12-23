import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCartSession } from '@/lib/session'
import { logger } from '@/lib/logger'

const MAX_POLL_TIME = 15000 // 15 seconds
const POLL_INTERVAL = 1000 // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST() {
  const log = logger.scope({ operation: 'cart.complete', endpoint: '/api/store/carts/complete' })

  try {
    const cartId = await getCartSession()

    if (!cartId) {
      log.warn('No cart session for complete')
      return NextResponse.json({ error: 'No cart session', type: 'cart' }, { status: 401 })
    }

    log.info('Starting order completion polling', { cartId })

    const payload = await getPayloadClient()

    // Check for sold out items before completing order
    const cartForValidation = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    })

    if (cartForValidation.items && cartForValidation.items.length > 0) {
      const unavailableItems = cartForValidation.items.filter((item) => {
        const product = typeof item.product === 'object' ? item.product : null
        if (!product) return false
        return (product.inventory ?? 1) === 0
      })

      if (unavailableItems.length > 0) {
        const unavailableNames = unavailableItems
          .map((item) => {
            const product = item.product as { title?: string }
            return product?.title || 'Unknown product'
          })
          .join(', ')

        log.warn('Cart contains sold out items at completion', {
          cartId,
          unavailableItems: unavailableItems.map((item) => {
            const product = item.product as { id?: string; title?: string }
            return { id: product?.id, title: product?.title }
          }),
        })

        return NextResponse.json(
          {
            type: 'cart',
            error: `Some items are no longer available: ${unavailableNames}`,
            code: 'ITEMS_UNAVAILABLE',
          },
          { status: 400 },
        )
      }
    }

    const startTime = Date.now()
    let pollCount = 0

    // Poll for order creation or payment status update
    while (Date.now() - startTime < MAX_POLL_TIME) {
      pollCount++

      try {
        const cart = await payload.findByID({
          collection: 'carts',
          id: cartId,
          depth: 0,
        })

        if (!cart) {
          log.error('Cart not found during polling', { cartId, pollCount })
          return NextResponse.json({ error: 'Cart not found', type: 'cart' }, { status: 404 })
        }

        log.debug('Poll check', {
          cartId,
          pollCount,
          elapsedMs: Date.now() - startTime,
          paymentStatus: cart.paymentStatus,
          completedAt: cart.completedAt ? 'set' : 'not set',
        })

        // Check if payment failed
        if (cart.paymentStatus === 'failed') {
          log.warn('Payment failed during polling', { cartId, pollCount })
          return NextResponse.json({ error: 'Payment failed', type: 'cart' }, { status: 400 })
        }

        // Check if cart was completed (order created by webhook)
        if (cart.completedAt && cart.paymentStatus === 'succeeded') {
          // Find the order
          const orders = await payload.find({
            collection: 'orders',
            where: {
              stripePaymentIntentId: { equals: cart.stripePaymentIntentId },
            },
            limit: 1,
          })

          if (orders.docs.length > 0) {
            log.info('Order found after polling', {
              cartId,
              orderId: String(orders.docs[0].id),
              displayId: String(orders.docs[0].displayId),
              pollCount,
              totalMs: Date.now() - startTime,
            })
            return NextResponse.json({ type: 'order', order: orders.docs[0] })
          }

          log.warn('Cart completed but no order found', { cartId, pollCount })
        }
      } catch (pollError) {
        log.error('Error during poll iteration', { cartId, pollCount }, pollError)
        // Continue polling despite errors
      }

      // Wait before next poll
      await sleep(POLL_INTERVAL)
    }

    // Timeout - webhook hasn't arrived yet
    log.warn('Polling timeout reached', {
      cartId,
      pollCount,
      totalMs: Date.now() - startTime,
    })

    // Return processing status so frontend can handle gracefully
    return NextResponse.json({
      type: 'processing',
      message: 'Payment is being processed. You will receive a confirmation email shortly.',
    })
  } catch (error) {
    log.error('Failed to complete order', {}, error)
    return NextResponse.json({ error: 'Failed to complete order', type: 'cart' }, { status: 500 })
  }
}
