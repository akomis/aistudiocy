import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { stripePlugin } from "@payloadcms/plugin-stripe";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Webhooks
import { paymentIntentFailed } from "./webhooks/paymentIntentFailed";
import { paymentIntentSucceeded } from "./webhooks/paymentIntentSucceeded";

// Collections
import { Carts } from "./collections/Carts";
import { Categories } from "./collections/Categories";
import { Coupons } from "./collections/Coupons";
import { Media } from "./collections/Media";
import { Orders } from "./collections/Orders";
import { Products } from "./collections/Products";
import { Shipping } from "./collections/Shipping";
import { Users } from "./collections/Users";

// Globals
import { Catalogue } from "./globals/Catalogue";
import { LandingPage } from "./globals/LandingPage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.FRONTEND_URL || "http://localhost:3000",
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      providers: ["@/components/admin/AdminStyleProvider"],
      views: {
        dashboard: {
          Component: "@/components/admin/Dashboard",
        },
      },
    },
  },
  collections: [
    Products,
    Categories,
    Media,
    Orders,
    Coupons,
    Shipping,
    Users,
    Carts,
  ],
  globals: [Catalogue, LandingPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "your-secret-key",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          generateFileURL: ({ filename }: { filename: string }) => {
            return `${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET}/${filename}`;
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
        region: "auto",
      },
    }),
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_API_KEY || "",
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET,
      rest: false,
      logs: process.env.NODE_ENV === "development",
      webhooks: {
        "payment_intent.succeeded": paymentIntentSucceeded,
        "payment_intent.payment_failed": paymentIntentFailed,
      },
    }),
  ],
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || "",
    defaultFromAddress: "noreply@mail.fosjewels.com",
    defaultFromName: "φως",
  }),
  cors: [process.env.FRONTEND_URL ?? "", "http://localhost:3000"],
  csrf: [process.env.FRONTEND_URL ?? "", "http://localhost:3000"],
  sharp,
});
