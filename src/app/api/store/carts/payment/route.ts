import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCartSession } from '@/lib/session'
import { logger } from '@/lib/logger'
import Stripe from 'stripe'

const getStripe = () =>
  new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: '2025-11-17.clover' as Stripe.LatestApiVersion,
  })

export async function POST() {
  const log = logger.scope({ operation: 'payment.create', endpoint: '/api/store/carts/payment' })

  try {
    const cartId = await getCartSession()

    if (!cartId) {
      log.warn('No cart session for payment')
      return NextResponse.json({ error: 'No cart session' }, { status: 401 })
    }

    log.debug('Creating payment intent', { cartId })

    const payload = await getPayloadClient()

    const cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    })

    log.debug('Cart retrieved for payment', {
      cartId,
      hasEmail: !!cart.email,
      hasShippingAddress: !!cart.shippingAddress?.firstName,
      itemCount: cart.items?.length || 0,
      total: cart.total,
    })

    if (!cart.email || !cart.shippingAddress?.firstName) {
      log.warn('Cart missing required info for payment', { cartId })
      return NextResponse.json(
        { error: 'Cart missing required customer information' },
        { status: 400 },
      )
    }

    if (!cart.items || cart.items.length === 0) {
      log.warn('Cart is empty for payment', { cartId })
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Create or update payment intent
    let paymentIntent: Stripe.PaymentIntent

    // Stripe expects amounts in cents
    const amountInCents = Math.round((cart.total || 0) * 100)

    log.debug('Calling Stripe API', {
      cartId,
      amountInCents,
      existingPaymentIntentId: cart.stripePaymentIntentId || null,
      action: cart.stripePaymentIntentId ? 'update' : 'create',
    })

    if (cart.stripePaymentIntentId) {
      // Update existing payment intent
      try {
        paymentIntent = await getStripe().paymentIntents.update(cart.stripePaymentIntentId, {
          amount: amountInCents,
        })
        log.debug('Stripe payment intent updated', {
          cartId,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        })
      } catch (stripeError) {
        log.error('Stripe update failed', { cartId, paymentIntentId: cart.stripePaymentIntentId }, stripeError)
        throw stripeError
      }
    } else {
      // Create new payment intent
      try {
        paymentIntent = await getStripe().paymentIntents.create({
          amount: amountInCents,
          currency: 'eur',
          metadata: { cartId },
          receipt_email: cart.email || undefined,
        })
        log.debug('Stripe payment intent created', {
          cartId,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        })
      } catch (stripeError) {
        log.error('Stripe create failed', { cartId }, stripeError)
        throw stripeError
      }

      // Save payment intent ID to cart
      await payload.update({
        collection: 'carts',
        id: cartId,
        data: {
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
      })

      log.debug('Payment intent saved to cart', { cartId, paymentIntentId: paymentIntent.id })
    }

    log.info('Payment intent ready', {
      cartId,
      paymentIntentId: paymentIntent.id,
    })

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    })
  } catch (error) {
    log.error('Failed to create payment intent', {}, error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
