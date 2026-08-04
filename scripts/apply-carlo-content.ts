import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { eq } from "drizzle-orm";
import { db, pageRevisions, pages } from "../lib/db";
import { aboutSections, servicesSections } from "../lib/db/seed-data/carlo-content";

const updates = [
  {
    slug: "/about",
    title: "About — Profile Landscapes",
    lede: "Commercial landscape construction, design, horticulture and long-term care—under one roof in Petersham since 1999.",
    seoTitle: "About Profile Landscapes | Commercial Landscaping Sydney",
    seoDescription: "Meet the integrated Sydney landscape team delivering planning, design, construction, horticulture and long-term maintenance since 1999.",
    sections: aboutSections,
  },
  {
    slug: "/services",
    title: "Services — Profile Landscapes",
    lede: "Complete commercial landscape delivery—from early planning and value engineering through construction, establishment and long-term management.",
    seoTitle: "Commercial Landscaping Services Sydney | Profile Landscapes",
    seoDescription: "Commercial landscape planning, construction, environmental works, irrigation, arboriculture, horticulture and maintenance across Sydney.",
    sections: servicesSections,
  },
] as const;

async function main() {
  await db.transaction(async (tx) => {
    for (const update of updates) {
      const [current] = await tx.select().from(pages).where(eq(pages.slug, update.slug)).limit(1);
      if (!current) throw new Error(`Page not found: ${update.slug}`);
      await tx.insert(pageRevisions).values({
        pageId: current.id,
        title: current.title,
        lede: current.lede,
        sections: current.sections,
      });
      await tx.update(pages).set({
        title: update.title,
        lede: update.lede,
        seoTitle: update.seoTitle,
        seoDescription: update.seoDescription,
        sections: update.sections,
        status: "live",
        publishedAt: current.publishedAt || new Date(),
        updatedAt: new Date(),
      }).where(eq(pages.id, current.id));
    }
  });
  console.log(`Updated ${updates.map((item) => item.slug).join(", ")} with revision snapshots.`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
