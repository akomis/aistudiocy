import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

const MAX_POLL_TIME = 15000 // 15 seconds
const POLL_INTERVAL = 1000 // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Cart ID is required', type: 'cart' }, { status: 400 })
    }
    const payload = await getPayloadClient()

    const startTime = Date.now()

    // Poll for order creation or payment status update
    while (Date.now() - startTime < MAX_POLL_TIME) {
      const cart = await payload.findByID({
        collection: 'carts',
        id,
        depth: 0,
      })

      if (!cart) {
        return NextResponse.json({ error: 'Cart not found', type: 'cart' }, { status: 404 })
      }

      // Check if payment failed
      if (cart.paymentStatus === 'failed') {
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
          return NextResponse.json({ type: 'order', order: orders.docs[0] })
        }
      }

      // Wait before next poll
      await sleep(POLL_INTERVAL)
    }

    // Timeout - webhook hasn't arrived yet
    // Return processing status so frontend can handle gracefully
    return NextResponse.json({
      type: 'processing',
      message: 'Payment is being processed. You will receive a confirmation email shortly.',
    })
  } catch (error) {
    console.error('Error in complete endpoint:', error)
    return NextResponse.json({ error: 'Failed to complete order', type: 'cart' }, { status: 500 })
  }
}
