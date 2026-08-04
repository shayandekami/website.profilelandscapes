import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getPublicSiteUrl();
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
