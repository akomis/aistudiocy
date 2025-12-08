import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'catalogueImages',
      type: 'array',
      admin: {
        description: 'Static images displayed in the catalogue',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'supportedCountries',
      type: 'array',
      admin: {
        description: 'Countries available for shipping',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Country name (e.g., "Greece")',
          },
        },
        {
          name: 'code',
          type: 'text',
          required: true,
          admin: {
            description: 'ISO code (e.g., "gr")',
          },
        },
      ],
    },
  ],
}
