import type { NextConfig } from "next";

// Image optimizer remote-host allowlist. Was `hostname: "**"` which turns
// /_next/image into an open proxy (SSRF / bandwidth abuse). Uploads are served
// locally from /uploads (same-origin, not subject to this list), so this only
// needs the hosts of any EXTERNAL images referenced in content. Configurable via
// IMAGE_REMOTE_HOSTS (comma-separated) so a CDN can be added without a code change.
const imageHosts = (
  process.env.IMAGE_REMOTE_HOSTS ||
  "profilelandscapes.com.au,**.profilelandscapes.com.au"
)
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Active theme is read at request time from env. Default = profile-landscapes.
  env: {
    THEME: process.env.THEME || "profile-landscapes",
  },
};

export default nextConfig;
