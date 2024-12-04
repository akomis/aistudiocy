import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.BUCKET_HOST ??
          process.env.NEXT_PUBLIC_BUCKET_HOST ??
          "bucket-dev.aistudiocy.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
