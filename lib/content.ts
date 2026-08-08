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
    careers_perks: boolean; // employee perks/benefits block on the careers page
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
      // Default OFF for the two that need Stripe — a deployment without payment
      // configured must not show a shop it cannot take money through. Turn them
      // on per-site in site_settings.commerce_features once Stripe is live.
      shop: false,
      nursery: false,
      encyclopedia: true,
      // Employee perks/benefits block: OFF until Carlo reviews + corrects the copy
      // (it currently lists perks PL doesn't offer). Staff still see it in preview.
      careers_perks: false,
      ...((out.commerce_features as Partial<SiteSettings["commerce_features"]>) || {}),
    },
  } as unknown as SiteSettings;
}

/**
 * Should this request see the real feature page?
 *
 * Public visitors get the FeatureUnavailable placeholder when a feature is off.
 * A signed-in admin always sees the real page, so switched-off sections stay
 * reviewable and editable without exposing a half-finished shop to the world.
 * Returns `preview: true` when it is only visible because you are staff — use it
 * to badge the page so nobody mistakes a hidden page for a live one.
 */
export async function featureAccess(
  feature: keyof SiteSettings["commerce_features"],
): Promise<{ visible: boolean; preview: boolean }> {
  const settings = await getSiteSettings();
  if (settings.commerce_features[feature]) return { visible: true, preview: false };
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (session?.user) return { visible: true, preview: true };
  } catch {
    /* auth unavailable (build/prerender) — fall through to hidden */
  }
  return { visible: false, preview: false };
}

export async function getPublicSiteUrl(origin?: string): Promise<string> {
  try {
    const settings = await getSiteSettings();
    return settings.public_url;
  } catch {
    return String(process.env.NEXT_PUBLIC_URL || origin || "https://profilelandscapes.com.au").replace(/\/$/, "");
  }
}
