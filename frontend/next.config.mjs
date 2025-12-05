import { withHighlightConfig } from "@highlight-run/next/config";

const bucketHost = process.env.NEXT_PUBLIC_BUCKET_HOST;

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
};

export default withHighlightConfig(nextConfig);
