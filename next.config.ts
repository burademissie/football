import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Allow images from API-Football CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
        pathname: '/football/**',
      },
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
        pathname: '/flags/**',
      },
    ],
  },

  // Environment variables validation
  env: {
    API_FOOTBALL_HOST: process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io',
  },
};

export default nextConfig;
