import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  orderable: true,
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
      unique: true,
    },
    {
      name: 'handle',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly slug (e.g., "bracelets")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'headerDesktop',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Desktop header image for landing page',
      },
    },
    {
      name: 'headerMobile',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Mobile header image for landing page',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data?.handle && data?.name) {
          data.handle = data.name.toLowerCase().replace(/\s+/g, '-')
        }
        return data
      },
    ],
  },
}
