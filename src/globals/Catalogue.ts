import type { GlobalConfig } from 'payload'

export const Catalogue: GlobalConfig = {
  slug: 'catalogue',
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'showcaseImages',
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
  ],
}
