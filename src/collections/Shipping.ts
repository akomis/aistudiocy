import type { CollectionConfig } from 'payload'
import { countryOptions } from '@/lib/countries'

export const Shipping: CollectionConfig = {
  slug: 'shipping',
  admin: {
    group: 'Store',
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
        description: 'Shipping cost in EUR',
      },
    },
    {
      name: 'countries',
      type: 'select',
      hasMany: true,
      required: true,
      options: countryOptions,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
