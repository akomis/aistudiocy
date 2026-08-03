import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  defaultSort: '-createdAt',
  admin: {
    group: 'Store',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'inventory', 'status'],
    components: {
      views: {
        list: {
          Component: '@/components/admin/ProductsListView',
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
    // Title + Status row
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
            width: '30%',
          },
        },
      ],
    },
    // Details row
    {
      type: 'row',
      fields: [
        {
          name: 'size',
          type: 'text',
          admin: {
            width: '20%',
          },
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
          admin: {
            width: '20%',
          },
        },
        {
          name: 'inventory',
          type: 'number',
          defaultValue: 1,
          min: 0,
          admin: {
            width: '20%',
          },
        },
        {
          name: 'price',
          label: 'Price (€)',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '20%',
          },
        },
        {
          name: 'compareAtPrice',
          label: 'Compare At (€)',
          type: 'number',
          min: 0,
          admin: {
            width: '20%',
          },
        },
      ],
    },
    // Description
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Product description (optional)',
      },
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
