export default ({ env }) => ({
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env("MINIO_KEY"),
            secretAccessKey: env("MINIO_SECRET"),
          },
          endpoint: env("MINIO_ENDPOINT"),
          region: env("MINIO_REGION"),
          forcePathStyle: true,
          params: {
            Bucket: "strapi",
          },
        },
      },
    },
  },
});
