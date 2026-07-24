import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "api.rupalihomes.com",
      },
      {
        protocol: "https",
        hostname: "jhyrkyidrxpflestimym.supabase.co",
      },
    ],
  },
};

export default nextConfig;
