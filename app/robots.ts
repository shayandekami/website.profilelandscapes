import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/trade/account", "/cart", "/checkout", "/quote-cart", "/schedule"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
