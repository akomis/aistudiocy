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
            description: 'Price snapshot at time of adding to cart (cents)',
          },
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'shippingAddress',
      type: 'group',
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
    },
    {
      name: 'subtotal',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Sum of item prices (cents)',
        readOnly: true,
      },
    },
    {
      name: 'shippingTotal',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Shipping cost (cents)',
        readOnly: true,
      },
    },
    {
      name: 'total',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total including shipping (cents)',
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
        let shippingTotal = data.shippingTotal || 0
        if (data.shippingOption && typeof data.shippingOption === 'string') {
          try {
            const shippingOptionDoc = await req.payload.findByID({
              collection: 'shipping',
              id: data.shippingOption,
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
