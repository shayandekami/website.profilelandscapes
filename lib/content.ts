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
  public_url: string;
  studio_name: string;
  tagline: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  legal: { acn: string; abn: string; licence: string; founded: number };
  theme_tokens: Record<string, string>;
  commerce_features: {
    shop: boolean;
    nursery: boolean;
    encyclopedia: boolean;
  };
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(siteSettings);
  const out: Record<string, unknown> = {};
  for (const r of rows) out[r.key] = r.value;
  return {
    ...out,
    public_url: String(out.public_url || process.env.NEXT_PUBLIC_URL || "https://profilelandscapes.com.au").replace(/\/$/, ""),
    commerce_features: {
      shop: true,
      nursery: true,
      encyclopedia: true,
      ...((out.commerce_features as Partial<SiteSettings["commerce_features"]>) || {}),
    },
  } as unknown as SiteSettings;
}

export async function getPublicSiteUrl(origin?: string): Promise<string> {
  try {
    const settings = await getSiteSettings();
    return settings.public_url;
  } catch {
    return String(process.env.NEXT_PUBLIC_URL || origin || "https://profilelandscapes.com.au").replace(/\/$/, "");
  }
}
