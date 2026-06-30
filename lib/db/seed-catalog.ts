/**
 * Seeds the full nursery + encyclopedia catalog from committed JSON snapshots, so
 * a fresh client deploy (`npm run db:seed`) recreates everything reproducibly.
 * Idempotent: plants/encyclopedia insert with onConflictDoNothing(slug); product
 * and project "extras" patch existing rows by slug.
 */
import { db } from "./index";
import { plants, encyclopediaEntries, products, projects } from "./schema";
import { eq } from "drizzle-orm";
import plantsData from "./seed-data/plants.json";
import encyclopediaData from "./seed-data/encyclopedia.json";
import productExtras from "./seed-data/product-extras.json";
import projectExtras from "./seed-data/project-extras.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
const cap = (v: any) => (v == null ? null : v);

export async function seedCatalog() {
  // ---- Plants ----
  let p = 0;
  for (const r of plantsData as any[]) {
    await db.insert(plants).values({
      slug: r.slug, latinName: r.latin_name, commonName: cap(r.common_name), family: cap(r.family),
      priceCents: r.price_cents, size: cap(r.size), variants: r.variants ?? [], stockQty: r.stock_qty ?? 0,
      tags: r.tags ?? [], images: r.images ?? [], shortDescription: cap(r.short_description),
      description: cap(r.description), care: cap(r.care), seasons: cap(r.seasons), companions: r.companions ?? [],
      encyclopediaSlug: cap(r.encyclopedia_slug), featured: !!r.featured, status: "live",
    }).onConflictDoNothing({ target: plants.slug });
    p++;
  }

  // ---- Encyclopedia ----
  let e = 0;
  for (const r of encyclopediaData as any[]) {
    await db.insert(encyclopediaEntries).values({
      slug: r.slug, latinName: r.latin_name, commonName: cap(r.common_name), family: cap(r.family),
      genus: cap(r.genus), description: cap(r.description), climateZones: r.climate_zones ?? [], tags: r.tags ?? [],
      care: cap(r.care), seasons: cap(r.seasons), companions: r.companions ?? [], images: r.images ?? [],
      cultivars: r.cultivars ?? [], landscapeUse: cap(r.landscape_use), references: r.references ?? [], status: "live",
    }).onConflictDoNothing({ target: encyclopediaEntries.slug });
    e++;
  }

  // ---- Product variant/spec patches ----
  for (const r of productExtras as any[]) {
    await db.update(products)
      .set({ sizes: r.sizes ?? [], colours: r.colours ?? [], fits: r.fits ?? [], specs: r.specs ?? [] })
      .where(eq(products.slug, r.slug));
  }

  // ---- Project case-study patches ----
  for (const r of projectExtras as any[]) {
    await db.update(projects)
      .set({ body: cap(r.body), costBreakdown: r.cost_breakdown ?? [], collaborators: r.collaborators ?? [] })
      .where(eq(projects.slug, r.slug));
  }

  console.log(`→ catalog seeded: ${p} plants, ${e} encyclopedia entries, ${(productExtras as any[]).length} product extras, ${(projectExtras as any[]).length} project extras`);
}
