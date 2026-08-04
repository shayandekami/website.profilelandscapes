import type { MetadataRoute } from "next";
import { db, pages, projects, plants, encyclopediaEntries, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { CARE_GUIDES } from "@/app/(public)/resources/guides";
import { getPublicSiteUrl, getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = await getPublicSiteUrl();
  const { commerce_features: features } = await getSiteSettings();

  const staticPaths = [
    "", "/projects", "/services", "/capability", "/landscape-design", "/careers",
    "/resources", "/about", "/contact", "/quote", "/privacy", "/terms",
    ...(features.nursery ? ["/plants", "/plants/pricelist", "/trade/login", "/trade/register"] : []),
    ...(features.encyclopedia ? ["/encyclopedia"] : []),
    ...(features.shop ? ["/shop"] : []),
  ];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));

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
    ...(features.nursery ? plantRows.map((r) => ({ url: `${base}/plants/${r.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })) : []),
    ...(features.encyclopedia ? encRows.map((r) => ({ url: `${base}/encyclopedia/${r.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 })) : []),
    ...(features.shop ? productRows.map((r) => ({ url: `${base}/shop/${r.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })) : []),
    ...CARE_GUIDES.map((guide) => ({ url: `${base}/resources/${guide.slug}`, lastModified: new Date(guide.updated), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];

  return [...staticRoutes, ...dyn];
}
