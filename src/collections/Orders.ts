import type { CollectionConfig } from 'payload'
import { sendOrderConfirmationEmail, sendOrderShippedEmail } from '../email/sendOrderEmails'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'displayId',
    defaultColumns: ['displayId', 'email', 'total', 'status', 'createdAt'],
  },
  access: {
    read: ({ req }) => !!req.user,
    create: () => true,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'displayId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'productId', type: 'text', required: true },
        { name: 'productTitle', type: 'text', required: true },
        { name: 'productDescription', type: 'text' },
        { name: 'thumbnail', type: 'text' },
        { name: 'quantity', type: 'number', required: true },
        { name: 'unitPrice', type: 'number', required: true },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
        { name: 'address1', type: 'text', required: true },
        { name: 'city', type: 'text', required: true },
        { name: 'postalCode', type: 'text', required: true },
        { name: 'countryCode', type: 'text', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'shippingMethod',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'amount', type: 'number' },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
    },
    {
      name: 'shippingTotal',
      type: 'number',
      required: true,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
    },
    {
      name: 'currencyCode',
      type: 'text',
      defaultValue: 'EUR',
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'fulfillmentStatus',
      type: 'select',
      defaultValue: 'not_fulfilled',
      options: [
        { label: 'Not Fulfilled', value: 'not_fulfilled' },
        { label: 'Partially Fulfilled', value: 'partially_fulfilled' },
        { label: 'Fulfilled', value: 'fulfilled' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about the order',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && data) {
          const count = await req.payload.count({ collection: 'orders' })
          data.displayId = `ORD-${(count.totalDocs + 1).toString().padStart(5, '0')}`
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        try {
          if (operation === 'create') {
            await sendOrderConfirmationEmail(doc, req.payload)
          }
          if (
            previousDoc?.fulfillmentStatus !== 'fulfilled' &&
            doc.fulfillmentStatus === 'fulfilled'
          ) {
            await sendOrderShippedEmail(doc, req.payload)
          }
        } catch (error) {
          console.error('Failed to send order email:', error)
        }
      },
    ],
  },
}
