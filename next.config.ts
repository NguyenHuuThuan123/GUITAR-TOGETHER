import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.trycloudflare.com',
    'localhost:3000',
    '192.168.1.12:3000',
    'love-prince-centers-pets.trycloudflare.com',
  ],
};

export default nextConfig;
