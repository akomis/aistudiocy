import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.POSTGRES_URL,
    databaseLogging: true,
    redisUrl: process.env.REDIS_URL,
    workerMode: "shared",
    databaseName: "railway",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    backendUrl: process.env.BACKEND_URL,
    disable: false,
  },
  modules: [
    {
      key: Modules.FILE,
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: `${process.env.BACKEND_URL}/static`,
            },
          },
        ],
      },
    },
    ...(process.env.REDIS_URL
      ? [
          {
            key: Modules.EVENT_BUS,
            resolve: "@medusajs/event-bus-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
          {
            key: Modules.WORKFLOW_ENGINE,
            resolve: "@medusajs/workflow-engine-redis",
            options: {
              redis: {
                url: process.env.REDIS_URL,
              },
            },
          },
        ]
      : []),
    // ...(process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL
    //   ? [
    //       {
    //         key: Modules.NOTIFICATION,
    //         resolve: "@medusajs/notification",
    //         options: {
    //           providers: [
    //             ...(process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL
    //               ? [
    //                   {
    //                     resolve: "./src/modules/email-notifications",
    //                     id: "resend",
    //                     options: {
    //                       channels: ["email"],
    //                       api_key: process.env.RESEND_API_KEY,
    //                       from: process.env.ADMIN_EMAIL,
    //                     },
    //                   },
    //                 ]
    //               : []),
    //           ],
    //         },
    //       },
    //     ]
    //   : []),
    ...(process.env.STRIPE_API_KEY && process.env.STRIPE_WEBHOOK_SECRET
      ? [
          {
            key: Modules.PAYMENT,
            resolve: "@medusajs/payment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: process.env.STRIPE_API_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
  plugins: [],
});
