import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  orderable: true,
  admin: {
    group: 'Store',
    useAsTitle: 'name',
    components: {
      views: {
        list: {
          Component: '@/components/admin/CategoriesGrid',
        },
      },
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      type: 'row',
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
            readOnly: true,
            width: '30%',
            description: 'URL-friendly slug (e.g., "bracelets")',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'headerDesktop',
          label: 'Desktop',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Desktop header image for landing page',
          },
        },
        {
          name: 'headerMobile',
          label: 'Mobile',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Mobile header image for landing page',
          },
        },
      ],
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
