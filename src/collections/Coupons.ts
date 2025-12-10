import type { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    group: 'Store',
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'usageCount', 'status'],
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
          name: 'code',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: {
            width: '30%',
            description: 'Unique coupon code (case-insensitive)',
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Flat (EUR)', value: 'flat' },
            { label: 'Percentage (%)', value: 'percentage' },
          ],
          defaultValue: 'flat',
          admin: {
            width: '20%',
          },
        },
        {
          name: 'value',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '15%',
            description: 'Amount in EUR or percentage',
          },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'active',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
          admin: {
            width: '15%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'minimumOrderAmount',
          label: 'Minimum Order (EUR)',
          type: 'number',
          min: 0,
          admin: {
            width: '25%',
            description: 'Minimum subtotal required to use this coupon',
          },
        },
        {
          name: 'usageLimit',
          type: 'number',
          min: 0,
          admin: {
            width: '25%',
            description: 'Maximum number of times this coupon can be used (leave empty for unlimited)',
          },
        },
        {
          name: 'usageCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            width: '25%',
            readOnly: true,
            description: 'Number of times this coupon has been used',
          },
        },
        {
          name: 'expiresAt',
          type: 'date',
          admin: {
            width: '25%',
            description: 'Coupon expiration date (optional)',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Normalize code to uppercase
        if (data?.code) {
          data.code = data.code.toUpperCase().trim()
        }
        return data
      },
    ],
  },
}
