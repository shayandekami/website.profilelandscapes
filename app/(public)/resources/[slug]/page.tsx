import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, encyclopediaEntries, plants } from "@/lib/db";
import { CARE_GUIDES, guideBySlug } from "../guides";
import styles from "../resources.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | Profile Landscapes`,
    description: guide.summary,
    keywords: guide.keywords,
    alternates: { canonical: `/resources/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.summary, images: [guide.image], type: "article" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const [entries, nursery] = await Promise.all([
    db.select().from(encyclopediaEntries).where(eq(encyclopediaEntries.status, "live")),
    db.select().from(plants).where(and(eq(plants.status, "live"))),
  ]);
  const related = entries.filter((entry) => {
    const tags = (entry.tags as string[]) || [];
    return guide.relatedTags.some((tag) => tags.includes(tag));
  }).slice(0, 4);
  const stocked = nursery.filter((plant) => {
    const tags = (plant.tags as string[]) || [];
    return guide.relatedTags.some((tag) => tags.includes(tag));
  }).slice(0, 4);
  const next = CARE_GUIDES[(CARE_GUIDES.findIndex((item) => item.slug === guide.slug) + 1) % CARE_GUIDES.length];
  const howToLd = {
    "@context": "https://schema.org", "@type": "HowTo", name: guide.title,
    description: guide.summary, image: guide.image,
    totalTime: `PT${guide.minutes}M`,
    supply: guide.tools.map((name) => ({ "@type": "HowToSupply", name })),
    step: guide.steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.title, text: step.body })),
  };

  return (
    <article className={styles.article}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />
      <header className={styles.articleHero}>
        <div className={styles.articleCrumb}><Link href="/resources">Plant care</Link><span>/</span><span>{guide.category}</span></div>
        <p className={styles.kicker}>{guide.category} · {guide.minutes} minute guide</p>
        <h1>{guide.title}</h1>
        <p>{guide.summary}</p>
        <div><span>{guide.difficulty}</span><span>{guide.steps.length} steps</span><span>Reviewed July 2026</span></div>
      </header>
      <figure className={styles.articleImage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={guide.image} alt={`Illustrated guide: ${guide.title}`} />
        <figcaption>Profile field guide / practical horticulture for Sydney conditions</figcaption>
      </figure>

      <div className={styles.articleLayout}>
        <aside>
          <p>In this guide</p>
          {guide.steps.map((step, index) => <a href={`#step-${index + 1}`} key={step.title}><span>{String(index + 1).padStart(2, "0")}</span>{step.title}</a>)}
        </aside>
        <div className={styles.articleBody}>
          <p className={styles.standfirst}>{guide.intro}</p>
          <section className={styles.tools}><p>Before you begin</p><h2>What you’ll need</h2><ul>{guide.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul></section>
          <section className={styles.steps}>
            {guide.steps.map((step, index) => (
              <div id={`step-${index + 1}`} key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h2>{step.title}</h2><p>{step.body}</p>{step.tip && <blockquote><strong>Field note</strong>{step.tip}</blockquote>}</div>
              </div>
            ))}
          </section>
          {guide.warnings?.length && <section className={styles.warning}><p>Important</p><h2>Common mistakes to avoid</h2><ul>{guide.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></section>}
          <p className={styles.disclaimer}>This guide provides general horticultural information for Sydney conditions. Site drainage, soil, weather and individual species requirements vary. For tree safety, chemical use or persistent plant decline, use an appropriately qualified professional.</p>
        </div>
      </div>

      <section className={styles.related}>
        <div className={styles.relatedHead}><p>Connected encyclopedia</p><h2>Plants related to this guide</h2><Link href={`/encyclopedia?tag=${guide.relatedTags[0]}`}>View all ↗</Link></div>
        <div className={styles.relatedGrid}>{related.map((entry) => {
          const image = (entry.images as Array<{ url: string; alt?: string }>)?.[0];
          return <Link href={`/encyclopedia/${entry.slug}`} key={entry.id}>{image && <img src={image.url} alt={image.alt || entry.commonName || entry.latinName} loading="lazy" />}<div><em>{entry.latinName}</em><h3>{entry.commonName || entry.genus}</h3><span>Care profile ↗</span></div></Link>;
        })}</div>
      </section>

      {stocked.length > 0 && <section className={styles.stocked}>
        <div><p>Available from our nursery</p><h2>Continue from advice to supply.</h2><span>Stock changes regularly. Open a plant to see current sizes and add it to a project schedule.</span></div>
        <div>{stocked.map((plant) => <Link href={`/plants/${plant.slug}`} key={plant.id}><em>{plant.latinName}</em><strong>{plant.commonName}</strong><span>{plant.stockQty > 0 ? `${plant.stockQty} in stock` : "Enquire"} ↗</span></Link>)}</div>
      </section>}

      <Link href={`/resources/${next.slug}`} className={styles.nextGuide}><p>Read next / {next.category}</p><h2>{next.title}</h2><span>Continue ↗</span></Link>
    </article>
  );
}
