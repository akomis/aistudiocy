import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Shipping } from './collections/Shipping'
import { Carts } from './collections/Carts'
import { Orders } from './collections/Orders'

// Globals
import { Catalogue } from './globals/Catalogue'
import { LandingPage } from './globals/LandingPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Products,
    Shipping,
    Carts,
    Orders,
  ],
  globals: [Catalogue, LandingPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          generateFileURL: ({ filename }: { filename: string }) => {
            return `${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET}/${filename}`
          },
        },
      },
      bucket: process.env.MINIO_BUCKET as string,
      config: {
        forcePathStyle: true,
        endpoint: process.env.MINIO_ENDPOINT as string,
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY as string,
          secretAccessKey: process.env.MINIO_SECRET_KEY as string,
        },
        region: 'auto',
      },
    }),
  ],
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress: process.env.ADMIN_EMAIL || 'noreply@example.com',
    defaultFromName: 'fos',
  }),
  cors: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000'],
  csrf: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000'],
})
