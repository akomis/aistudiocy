import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.fosjewels.com",
        pathname: "/**",
      },
    ],
  },
  sassOptions: {
    silenceDeprecations: ["legacy-js-api", "import"],
  },
};

export default withPayload(nextConfig);
