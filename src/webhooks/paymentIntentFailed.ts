import type { StripeWebhookHandler } from '@payloadcms/plugin-stripe/types'
import type Stripe from 'stripe'

export const paymentIntentFailed: StripeWebhookHandler<{
  data: { object: Stripe.PaymentIntent }
}> = async ({ event, payload }) => {
  const paymentIntent = event.data.object
  const cartId = paymentIntent.metadata?.cartId

  if (!cartId) {
    payload.logger.warn('PaymentIntent failed but missing cartId in metadata')
    return
  }

  payload.logger.info(`Processing payment_intent.payment_failed for cart ${cartId}`)

  try {
    // Update cart to reflect failed payment
    await payload.update({
      collection: 'carts',
      id: cartId,
      data: {
        paymentStatus: 'failed',
        // Clear payment intent so user can retry
        stripePaymentIntentId: '',
        stripeClientSecret: '',
      },
    })

    payload.logger.info(`Marked cart ${cartId} as payment failed`)
  } catch (error) {
    payload.logger.error(`Error processing payment failure: ${error}`)
  }
}
