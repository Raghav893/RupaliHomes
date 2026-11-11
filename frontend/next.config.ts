import type { NextConfig } from "next";

const storageHostname = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  .match(/^https:\/\/([a-z0-9]+\.supabase\.co)\/?$/i)?.[1];

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
      ...(storageHostname ? [{
        protocol: "https" as const,
        hostname: storageHostname,
        pathname: "/storage/v1/object/public/images/**",
      }] : []),
    ],
  },
};

export default nextConfig;
