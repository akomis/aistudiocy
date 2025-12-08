import { withPayload } from "@payloadcms/next/withPayload";

const bucketHost = process.env.NEXT_PUBLIC_BUCKET_HOST;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: bucketHost
      ? [
          {
            protocol: "https",
            hostname: bucketHost,
            pathname: "/**",
          },
        ]
      : [],
  },
  sassOptions: {
    silenceDeprecations: ["legacy-js-api", "import"],
  },
};

export default withPayload(nextConfig);
