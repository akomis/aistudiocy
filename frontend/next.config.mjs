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

export default nextConfig;
