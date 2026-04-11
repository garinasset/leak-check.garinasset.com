import type { NextConfig } from "next";

const extraServerActionOrigins = (
  process.env.NEXT_SERVER_ACTION_ALLOWED_ORIGINS ?? ""
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const vercelOrigin = process.env.VERCEL_URL?.trim();

const serverActionAllowedOrigins = Array.from(
  new Set([
    "leak-check.garinasset.com",
    "*.vercel.app",
    ...(vercelOrigin ? [vercelOrigin] : []),
    ...extraServerActionOrigins,
  ])
);

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins,
    },
  },
  allowedDevOrigins: ['172.16.1.5'],
};

export default nextConfig;