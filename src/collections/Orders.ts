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
    // Hidden displayId (still used as title)
    {
      name: 'displayId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        hidden: true,
      },
    },
    // Top row: Email, Payment Status, Fulfillment Status
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          admin: {
            readOnly: true,
            width: '40%',
          },
        },
        {
          name: 'status',
          label: 'Payment Status',
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
          admin: {
            readOnly: true,
            width: '30%',
          },
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
          admin: {
            width: '30%',
          },
        },
      ],
    },
    // Totals row
    {
      type: 'row',
      fields: [
        {
          name: 'subtotal',
          label: 'Subtotal (€)',
          type: 'number',
          required: true,
          admin: {
            readOnly: true,
            width: '33%',
          },
        },
        {
          name: 'shippingTotal',
          label: 'Shipping (€)',
          type: 'number',
          required: true,
          admin: {
            readOnly: true,
            width: '33%',
          },
        },
        {
          name: 'total',
          label: 'Total (€)',
          type: 'number',
          required: true,
          admin: {
            readOnly: true,
            width: '34%',
          },
        },
      ],
    },
    // Items
    {
      name: 'items',
      type: 'array',
      required: true,
      admin: {
        readOnly: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'productTitle', type: 'text', required: true, admin: { width: '50%' } },
            {
              name: 'unitPrice',
              label: 'Unit Price (€)',
              type: 'number',
              required: true,
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'quantity', type: 'number', required: true, admin: { width: '20%' } },
            { name: 'productId', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'thumbnail', type: 'text', admin: { width: '40%' } },
          ],
        },
      ],
    },
    // Shipping Address (collapsible)
    {
      type: 'collapsible',
      label: 'Shipping Address',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'shippingAddress',
          type: 'group',
          label: ' ',
          admin: {
            readOnly: true,
            hideGutter: true,
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'firstName', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'lastName', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            { name: 'address1', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'city', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'postalCode', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'countryCode', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'phone', type: 'text', admin: { width: '50%' } },
              ],
            },
          ],
        },
      ],
    },
    // Shipping Method (collapsible)
    {
      type: 'collapsible',
      label: 'Shipping Method',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'shippingMethod',
          type: 'group',
          label: ' ',
          admin: {
            readOnly: true,
            hideGutter: true,
          },
          fields: [
            { name: 'name', type: 'text' },
            { name: 'amount', label: 'Amount (€)', type: 'number' },
          ],
        },
      ],
    },
    // Currency (hidden)
    {
      name: 'currencyCode',
      type: 'text',
      defaultValue: 'EUR',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    // Payment info (collapsible)
    {
      type: 'collapsible',
      label: 'Payment Details',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'stripePaymentIntentId',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    // Notes (at bottom)
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
