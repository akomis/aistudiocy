import type { CollectionConfig } from 'payload'

export const ShippingOptions: CollectionConfig = {
  slug: 'shipping-options',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Shipping cost in cents (EUR). E.g., 500 = 5.00 EUR',
      },
    },
    {
      name: 'countries',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Country codes this shipping option applies to',
      },
      fields: [
        {
          name: 'countryCode',
          type: 'text',
          required: true,
          admin: {
            description: 'ISO country code (e.g., "gr", "de", "us")',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'estimatedDays',
      type: 'text',
      admin: {
        description: 'Estimated delivery time (e.g., "3-5 business days")',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
