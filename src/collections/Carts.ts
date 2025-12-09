import type { CollectionConfig } from 'payload'

export const Carts: CollectionConfig = {
  slug: 'carts',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          admin: {
            description: 'Price snapshot at time of adding to cart (EUR)',
          },
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'shippingAddress',
      type: 'group',
      admin: {
        readOnly: true,
      },
      fields: [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'address1', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'countryCode', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'billingAddress',
      type: 'group',
      admin: {
        readOnly: true,
      },
      fields: [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'address1', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'countryCode', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'shippingOption',
      type: 'relationship',
      relationTo: 'shipping',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'subtotal',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Sum of item prices (EUR)',
        readOnly: true,
      },
    },
    {
      name: 'shippingTotal',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Shipping cost (EUR)',
        readOnly: true,
      },
    },
    {
      name: 'total',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total including shipping (EUR)',
        readOnly: true,
      },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'stripeClientSecret',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'pending',
      admin: {
        readOnly: true,
        description: 'Payment status from Stripe webhook',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data) return data

        // Calculate subtotal from items
        let subtotal = 0
        if (data.items && Array.isArray(data.items)) {
          for (const item of data.items) {
            subtotal += (item.unitPrice || 0) * (item.quantity || 1)
          }
        }

        // Get shipping total from shipping option
        let shippingTotal = 0
        if (data.shippingOption) {
          // Handle string, number, or object shipping option IDs
          const shippingOptionId = typeof data.shippingOption === 'object'
            ? data.shippingOption.id
            : String(data.shippingOption)
          try {
            const shippingOptionDoc = await req.payload.findByID({
              collection: 'shipping',
              id: shippingOptionId,
            })
            if (shippingOptionDoc) {
              shippingTotal = shippingOptionDoc.amount || 0
            }
          } catch {
            // Ignore errors
          }
        }

        data.subtotal = subtotal
        data.shippingTotal = shippingTotal
        data.total = subtotal + shippingTotal

        return data
      },
    ],
  },
}
