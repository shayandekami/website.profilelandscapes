import type { Metadata } from "next";
import Link from "next/link";
import { db, encyclopediaEntries, plants } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";
import { CARE_GUIDES } from "./guides";
import styles from "./resources.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sydney Plant Care Guides & Garden Maintenance | Profile Landscapes",
  description: "Practical, illustrated plant-care guides from Sydney horticulturalists: watering, pruning, mulching, soil, pests, tree establishment and seasonal garden maintenance.",
  alternates: { canonical: "/resources" },
};

const COLLECTIONS = [
  ["Australian natives", "Local and Australian species for habitat, hardiness and provenance.", "/encyclopedia?tag=NATIVE", "NATIVE"],
  ["Waterwise planting", "Low-water species for unirrigated beds, verges and western aspects.", "/encyclopedia?tag=DROUGHT", "DROUGHT"],
  ["Coastal planting", "Plants suited to salt spray, exposed wind and sandy soils.", "/encyclopedia?tag=COASTAL", "COASTAL"],
  ["Shade and courtyards", "Reliable performers for southern aspects and under-canopy gardens.", "/encyclopedia?tag=SHADE", "SHADE"],
] as const;

export default async function ResourcesPage() {
  const collections = await Promise.all(COLLECTIONS.map(async ([title, copy, href, tag]) => {
    const rows = await db.select({ images: encyclopediaEntries.images }).from(encyclopediaEntries)
      .where(and(eq(encyclopediaEntries.status, "live"), sql`${encyclopediaEntries.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`));
    const image = rows.find((row) => (row.images as Array<{ url: string }>)?.[0]?.url)?.images as Array<{ url: string }> | undefined;
    return { title, copy, href, count: rows.length, image: image?.[0]?.url };
  }));
  const [{ count: nurseryCount }] = await db.select({ count: sql<number>`count(*)` }).from(plants).where(eq(plants.status, "live"));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.shell}>
          <p className={styles.kicker}>The Profile field guide / Sydney</p>
          <h1>Grow well.<br /><em>Keep it that way.</em></h1>
          <div className={styles.heroFoot}>
            <p>Clear, illustrated advice for maintaining plants in Sydney conditions—written to help you diagnose first, act carefully and understand when a specialist is needed.</p>
            <div><strong>{CARE_GUIDES.length}</strong><span>practical guides</span><strong>683</strong><span>plant profiles</span></div>
          </div>
        </div>
      </section>

      <section className={styles.featured}>
        <div className={styles.shell}>
          <div className={styles.sectionHead}><div><span>01</span><p>Start with the essentials</p></div><h2>Care guides for<br /><em>real gardens.</em></h2></div>
          <Link className={styles.leadCard} href={`/resources/${CARE_GUIDES[0].slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CARE_GUIDES[0].image} alt="" />
            <div><p>{CARE_GUIDES[0].category} · {CARE_GUIDES[0].minutes} min</p><h3>{CARE_GUIDES[0].title}</h3><span>{CARE_GUIDES[0].summary}</span><b>Read the illustrated guide ↗</b></div>
          </Link>
        </div>
      </section>

      <section className={styles.library}>
        <div className={styles.shell}>
          <div className={styles.libraryBar}><h2>Plant care library</h2><p>Save the guesswork. Each guide includes tools, steps, warnings and plants that suit the advice.</p></div>
          <div className={styles.guideGrid}>
            {CARE_GUIDES.slice(1).map((guide, index) => (
              <Link className={styles.guideCard} href={`/resources/${guide.slug}`} key={guide.slug}>
                <div className={styles.cardImage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={guide.image} alt="" loading="lazy" />
                  <span>{String(index + 2).padStart(2, "0")}</span>
                </div>
                <div className={styles.cardBody}>
                  <p>{guide.category} · {guide.minutes} min</p>
                  <h3>{guide.title}</h3>
                  <span>{guide.summary}</span>
                  <b>How to guide ↗</b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.collections}>
        <div className={styles.shell}>
          <div className={styles.sectionHead}><div><span>02</span><p>Choose plants by condition</p></div><h2>Turn advice into<br /><em>a planting palette.</em></h2></div>
          <div className={styles.collectionGrid}>
            {collections.map((item) => (
              <Link href={item.href} key={item.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {item.image && <img src={item.image} alt="" loading="lazy" />}
                <div><p>{item.count} encyclopedia profiles</p><h3>{item.title}</h3><span>{item.copy}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.bridge}>
        <div className={styles.shell}><div><p className={styles.kicker}>From reference to reality</p><h2>Find it. Understand it.<br /><em>Source it.</em></h2></div><div><p>Every care guide connects to suitable plant profiles. When a species is stocked, continue directly to nursery sizes and availability.</p><div><Link href="/encyclopedia">Browse 683 plant profiles ↗</Link><Link href="/plants">See {Number(nurseryCount)} nursery plants ↗</Link></div></div></div>
      </section>
    </div>
  );
}
