import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  serverActions: {
    bodySizeLimit: "10mb",
  },
};

export default withPayload(nextConfig);
