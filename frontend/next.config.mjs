import { withHighlightConfig } from "@highlight-run/next/config";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_BUCKET_HOST,
        pathname: "/**",
      },
    ],
  },
};

export default withHighlightConfig(nextConfig);
