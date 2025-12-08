import type { Payload } from 'payload'
import { render } from '@react-email/components'
import { OrderConfirmationEmail } from './templates/order-confirmation'

interface Order {
  displayId: string
  email: string
  items: Array<{
    productId: string
    productTitle: string
    productDescription?: string
    thumbnail?: string
    quantity: number
    unitPrice: number
  }>
  shippingAddress: {
    firstName: string
    lastName: string
    address1: string
    city: string
    postalCode: string
    countryCode: string
    phone?: string
  }
  shippingMethod?: {
    name?: string
    amount?: number
  }
  subtotal: number
  shippingTotal: number
  total: number
  createdAt: string
}

export async function sendOrderConfirmationEmail(order: Order, payload: Payload) {
  const html = await render(
    OrderConfirmationEmail({
      order,
      preview: 'Thank you for your order',
      message:
        'Your order has been placed successfully. You will receive another email when your order ships.',
    }),
  )

  // Send to customer
  await payload.sendEmail({
    to: order.email,
    subject: `fos - Your order has been placed`,
    html,
  })

  // Send notification to admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const adminHtml = await render(
      OrderConfirmationEmail({
        order: {
          ...order,
          shippingAddress: {
            ...order.shippingAddress,
            firstName: 'Admin',
            lastName: '',
          },
        },
        preview: 'New order received',
        message: `A new order has been placed by ${order.email}.`,
      }),
    )

    await payload.sendEmail({
      to: adminEmail,
      subject: `fos - New order: ${order.displayId}`,
      html: adminHtml,
    })
  }
}

export async function sendOrderShippedEmail(order: Order, payload: Payload) {
  const html = await render(
    OrderConfirmationEmail({
      order,
      preview: 'Your order has shipped',
      message:
        'Your order has been shipped and is on its way to you. If you do not hear from the delivery provider soon, please contact us.',
    }),
  )

  await payload.sendEmail({
    to: order.email,
    subject: `fos - Your order has been shipped`,
    html,
  })
}
