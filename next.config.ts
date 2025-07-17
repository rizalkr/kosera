import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.56.1:3000','http://localhost'],
  
  // Docker and production optimizations
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Image optimization for Docker
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Additional security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};


export default nextConfig;
