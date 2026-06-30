import type { MetadataRoute } from "next";
import { db, pages, projects, plants, encyclopediaEntries, products } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/projects", "/services", "/capability", "/landscape-design", "/careers",
    "/plants", "/plants/pricelist", "/encyclopedia", "/resources", "/shop",
    "/about", "/contact", "/quote", "/trade/login", "/trade/register", "/privacy", "/terms",
  ].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));

  const [cmsPages, projectRows, plantRows, encRows, productRows] = await Promise.all([
    db.select({ slug: pages.slug, updatedAt: pages.updatedAt }).from(pages).where(eq(pages.status, "live")),
    db.select({ slug: projects.slug, updatedAt: projects.updatedAt }).from(projects).where(eq(projects.status, "live")),
    db.select({ slug: plants.slug }).from(plants).where(eq(plants.status, "live")),
    db.select({ slug: encyclopediaEntries.slug }).from(encyclopediaEntries).where(eq(encyclopediaEntries.status, "live")),
    db.select({ slug: products.slug }).from(products).where(eq(products.status, "live")),
  ]);

  const dyn: MetadataRoute.Sitemap = [
    ...cmsPages.filter((p) => !p.slug.startsWith("/")).map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt ?? now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...projectRows.map((r) => ({ url: `${base}/projects/${r.slug}`, lastModified: r.updatedAt ?? now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...plantRows.map((r) => ({ url: `${base}/plants/${r.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...encRows.map((r) => ({ url: `${base}/encyclopedia/${r.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...productRows.map((r) => ({ url: `${base}/shop/${r.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];

  return [...staticRoutes, ...dyn];
}
