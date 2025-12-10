import type { GlobalConfig } from 'payload'

export const LandingPage: GlobalConfig = {
  slug: 'landing-page',
  admin: {
    group: 'Appearance',
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'abouts',
      type: 'array',
      admin: {
        description: 'About sections displayed on the landing page',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      admin: {
        description: 'Social media links displayed in the footer',
      },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          admin: {
            description: 'Social platform name (e.g., "Instagram", "Email", "Facebook")',
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: {
            description: 'Display name or handle (e.g., "@fos_jewellery")',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Full URL to the social media profile',
          },
        },
      ],
    },
    {
      name: 'footerImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Background image for footer section',
      },
    },
  ],
}
