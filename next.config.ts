import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Active theme is read at request time from env. Default = profile-landscapes.
  env: {
    THEME: process.env.THEME || "profile-landscapes",
  },
};

export default nextConfig;
