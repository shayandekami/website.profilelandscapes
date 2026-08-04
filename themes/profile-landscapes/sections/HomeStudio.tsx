import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, encyclopediaEntries, plants, projects } from "@/lib/db";
import styles from "./HomeStudio.module.css";

type LinkItem = { label: string; href: string };
type Props = {
  heroEyebrow?: string; heroTitle?: string; heroItalic?: string; heroBody?: string;
  heroImage?: string; heroImageAlt?: string; heroPrimary?: LinkItem; heroSecondary?: LinkItem;
  heroNote?: string;
  stats?: Array<{ value: string; label: string }>;
  introEyebrow?: string; introTitle?: string; introItalic?: string; introBody?: string;
  practices?: Array<{ number: string; title: string; body: string; href: string; label: string; icon?: string; iconAlt?: string }>;
  workEyebrow?: string; workTitle?: string; workItalic?: string; workBody?: string; workCta?: LinkItem;
  capabilityEyebrow?: string; capabilityTitle?: string; capabilityBody?: string; capabilityImage?: string; capabilityImageAlt?: string; capabilityGraphic?: string; capabilityGraphicAlt?: string; capabilityCta?: LinkItem;
  nurseryEyebrow?: string; nurseryTitle?: string; nurseryItalic?: string; nurseryBody?: string; nurseryCta?: LinkItem; nurserySecondary?: LinkItem;
  knowledgeEyebrow?: string; knowledgeTitle?: string; knowledgeItalic?: string; knowledgeBody?: string;
  knowledgeLinks?: Array<{ title: string; body: string; href: string; label: string }>;
  tenderEyebrow?: string; tenderTitle?: string; tenderItalic?: string; tenderBody?: string; tenderCta?: LinkItem; tenderEmail?: string;
};

const imageOf = (value: unknown) => (value as Array<{ url?: string; alt?: string }>)?.find((item) => item.url)?.url;

export async function HomeStudio({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const [work, stock, encyclopediaCount] = await Promise.all([
    db.select().from(projects).where(eq(projects.status, "live")).orderBy(desc(projects.featured), desc(projects.completedAt)).limit(5),
    db.select().from(plants).where(eq(plants.status, "live")).orderBy(desc(plants.featured), desc(plants.stockQty)).limit(4),
    db.$count(encyclopediaEntries, eq(encyclopediaEntries.status, "live")),
  ]);
  const lead = work[0];

  return <div className={styles.home}>
    <section className={styles.hero}>
      {p.heroImage && <img className={styles.heroImage} src={p.heroImage} alt={p.heroImageAlt || ""} />}
      <div className={styles.heroShade} />
      <div className={styles.heroTop}><span>{p.heroEyebrow}</span><span>{p.heroNote}</span></div>
      <div className={styles.heroContent}>
        <h1>{p.heroTitle}<em>{p.heroItalic}</em></h1>
        <div className={styles.heroBottom}>
          <p>{p.heroBody}</p>
          <div>{p.heroPrimary && <Link href={p.heroPrimary.href}>{p.heroPrimary.label}</Link>}{p.heroSecondary && <Link href={p.heroSecondary.href}>{p.heroSecondary.label}</Link>}</div>
        </div>
      </div>
      <a className={styles.scroll} href="#home-intro" aria-label="Scroll to introduction">↓</a>
    </section>

    <section className={styles.statStrip}>{p.stats?.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</section>

    <section className={styles.intro} id="home-intro">
      <div className={styles.kicker}><span>01</span>{p.introEyebrow}</div>
      <div className={styles.introCopy}><h2>{p.introTitle}<em>{p.introItalic}</em></h2><p>{p.introBody}</p></div>
      <div className={styles.practiceGrid}>{p.practices?.map((item) => <Link href={item.href} key={item.number}>{item.icon && <img src={item.icon} alt={item.iconAlt || ""}/>}<span>{item.number}</span><h3>{item.title}</h3><p>{item.body}</p><b>{item.label}</b></Link>)}</div>
    </section>

    <section className={styles.work}>
      <div className={styles.workHead}><div className={styles.kicker}><span>02</span>{p.workEyebrow}</div><div><h2>{p.workTitle}<em>{p.workItalic}</em></h2><p>{p.workBody}</p></div>{p.workCta && <Link href={p.workCta.href}>{p.workCta.label}</Link>}</div>
      {lead && <Link className={styles.leadWork} href={`/projects/${lead.slug}`}><img src={lead.heroImage || ""} alt={lead.title}/><div><p>{lead.suburb} / {lead.sector}</p><h3>{lead.title}</h3><span>{lead.summary}</span><b>View case study ↗</b></div></Link>}
      <div className={styles.workRail}>{work.slice(1).map((project, index) => <Link href={`/projects/${project.slug}`} key={project.id}><div><img src={project.heroImage || ""} alt={project.title}/><span>{String(index + 2).padStart(2, "0")}</span></div><p>{project.suburb}</p><h3>{project.title}</h3></Link>)}</div>
    </section>

    <section className={styles.capability}>
      <div className={styles.capImage}>{p.capabilityImage && <img src={p.capabilityImage} alt={p.capabilityImageAlt || ""}/>}<span>Design / build / establish</span></div>
      <div className={styles.capCopy}>{p.capabilityGraphic && <img className={styles.capGraphic} src={p.capabilityGraphic} alt={p.capabilityGraphicAlt || ""}/>}<div className={styles.kicker}><span>03</span>{p.capabilityEyebrow}</div><h2>{p.capabilityTitle}</h2><p>{p.capabilityBody}</p>{p.capabilityCta && <Link href={p.capabilityCta.href}>{p.capabilityCta.label}</Link>}</div>
    </section>

    <section className={styles.nursery}>
      <div className={styles.nurseryCopy}><div className={styles.kicker}><span>04</span>{p.nurseryEyebrow}</div><h2>{p.nurseryTitle}<em>{p.nurseryItalic}</em></h2><p>{p.nurseryBody}</p><div>{p.nurseryCta && <Link href={p.nurseryCta.href}>{p.nurseryCta.label}</Link>}{p.nurserySecondary && <Link href={p.nurserySecondary.href}>{p.nurserySecondary.label}</Link>}</div></div>
      <div className={styles.plantGrid}>{stock.map((plant) => <Link href={`/plants/${plant.slug}`} key={plant.id}>{imageOf(plant.images) && <img src={imageOf(plant.images)} alt={plant.commonName || plant.latinName}/>}<div><em>{plant.latinName}</em><h3>{plant.commonName}</h3><span>{plant.stockQty} available · from ${(plant.priceCents / 100).toFixed(2)}</span></div></Link>)}</div>
    </section>

    <section className={styles.knowledge}>
      <div><div className={styles.kicker}><span>05</span>{p.knowledgeEyebrow}</div><h2>{p.knowledgeTitle}<em>{p.knowledgeItalic}</em></h2><p>{p.knowledgeBody}</p><strong>{encyclopediaCount}<small>documented plant profiles</small></strong></div>
      <div className={styles.knowledgeLinks}>{p.knowledgeLinks?.map((item, index) => <Link href={item.href} key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.body}</p></div><b>{item.label}</b></Link>)}</div>
    </section>

    <section className={styles.tender}><div className={styles.kicker}><span>06</span>{p.tenderEyebrow}</div><h2>{p.tenderTitle}<em>{p.tenderItalic}</em></h2><div><p>{p.tenderBody}</p><div>{p.tenderCta && <Link href={p.tenderCta.href}>{p.tenderCta.label}</Link>}{p.tenderEmail && <a href={`mailto:${p.tenderEmail}`}>{p.tenderEmail}</a>}</div></div></section>
  </div>;
}
