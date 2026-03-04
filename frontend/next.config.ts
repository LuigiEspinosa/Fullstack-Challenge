import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "reqres.in",
        pathname: "/img/**",
      },
    ],
  },
  async rewrites() {
    if (!process.env.API_URL) return [];
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
