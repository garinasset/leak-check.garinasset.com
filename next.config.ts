import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "172.16.1.5",
  ],
};

export default nextConfig;