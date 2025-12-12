import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCartSession } from '@/lib/session'
import Stripe from 'stripe'

const getStripe = () =>
  new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: '2025-11-17.clover' as Stripe.LatestApiVersion,
  })

export async function POST() {
  try {
    const cartId = await getCartSession()

    if (!cartId) {
      return NextResponse.json({ error: 'No cart session' }, { status: 401 })
    }

    const payload = await getPayloadClient()

    const cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    })

    if (!cart.email || !cart.shippingAddress?.firstName) {
      return NextResponse.json(
        { error: 'Cart missing required customer information' },
        { status: 400 },
      )
    }

    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Create or update payment intent
    let paymentIntent: Stripe.PaymentIntent

    // Stripe expects amounts in cents
    const amountInCents = Math.round((cart.total || 0) * 100)

    if (cart.stripePaymentIntentId) {
      // Update existing payment intent
      paymentIntent = await getStripe().paymentIntents.update(cart.stripePaymentIntentId, {
        amount: amountInCents,
      })
    } else {
      // Create new payment intent
      paymentIntent = await getStripe().paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        metadata: { cartId },
        receipt_email: cart.email || undefined,
      })

      // Save payment intent ID to cart
      await payload.update({
        collection: 'carts',
        id: cartId,
        data: {
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
      })
    }

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
