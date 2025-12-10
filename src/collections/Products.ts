import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'available', 'status'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    // Title and available row
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            width: '70%',
          },
        },
        {
          name: 'available',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '30%',
            description: 'Available for purchase',
            style: {
              alignSelf: 'flex-end',
            },
          },
        },
      ],
    },
    // Thumbnail
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    // Gallery
    {
      name: 'images',
      type: 'array',
      label: 'Gallery',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    // Category and status row
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'published',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' },
          ],
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'handle',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        hidden: true,
      },
    },
    // Pricing row
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          label: 'Price (€)',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'compareAtPrice',
          label: 'Compare At Price (€)',
          type: 'number',
          min: 0,
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.title) {
          data.handle = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }
        return data
      },
    ],
  },
}
