import "server-only";
import { db, pages, siteSettings, type Section } from "@/lib/db";
import { eq } from "drizzle-orm";

/**
 * The Content API — used by both public pages and the admin preview.
 * Keep this as the single point of truth for "load a page".
 */

export type PageRecord = {
  id: number;
  slug: string;
  title: string;
  lede: string | null;
  sections: Section[];
  heroImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: "draft" | "live";
};

export async function getPage(slug: string): Promise<PageRecord | null> {
  const row = await db.query.pages.findFirst({
    where: eq(pages.slug, slug),
  });
  if (!row) return null;
  return row as unknown as PageRecord;
}

export type SiteSettings = {
  studio_name: string;
  tagline: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  legal: { acn: string; abn: string; licence: string; founded: number };
  theme_tokens: Record<string, string>;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(siteSettings);
  const out: Record<string, unknown> = {};
  for (const r of rows) out[r.key] = r.value;
  return out as unknown as SiteSettings;
}
