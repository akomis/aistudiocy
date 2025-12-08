import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req }) => !!req.user,
    // Allow first user creation (when no users exist yet)
    create: async ({ req }) => {
      if (!req.user) {
        const { totalDocs } = await req.payload.count({ collection: 'users' })
        return totalDocs === 0
      }
      return true
    },
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
    admin: ({ req }) => !!req.user,
  },
  fields: [],
}
