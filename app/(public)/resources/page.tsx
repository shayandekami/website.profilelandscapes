import type { Metadata } from "next";
import { db, encyclopediaEntries, plants } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plant selection guides — Profile Landscapes",
  description: "Curated plant-selection guides for Sydney landscapes: waterwise, coastal, screening, natives, shade, fragrant and advanced specimen trees — drawn from our 380-species encyclopedia.",
};

type Guide = {
  title: string;
  blurb: string;
  href: string;
  source: "encyclopedia" | "plants";
  tag?: string;
  advanced?: boolean;
};

const GUIDES: Guide[] = [
  { title: "Australian natives", blurb: "Indigenous and Australian species we grow and specify — habitat, hardiness and provenance.", href: "/encyclopedia?tag=NATIVE", source: "encyclopedia", tag: "NATIVE" },
  { title: "WaterWise & drought-tolerant", blurb: "Low-water species for unirrigated beds, verges and west-facing aspects.", href: "/encyclopedia?tag=DROUGHT", source: "encyclopedia", tag: "DROUGHT" },
  { title: "Coastal & salt-tolerant", blurb: "Species that hold up to salt spray, wind and sandy soils.", href: "/encyclopedia?tag=COASTAL", source: "encyclopedia", tag: "COASTAL" },
  { title: "Shade & courtyard", blurb: "Reliable performers for southern aspects, under-canopy and courtyards.", href: "/encyclopedia?tag=SHADE", source: "encyclopedia", tag: "SHADE" },
  { title: "Fragrant gardens", blurb: "Scented shrubs, climbers and feature plants for entries and outdoor rooms.", href: "/encyclopedia?tag=FRAGRANT", source: "encyclopedia", tag: "FRAGRANT" },
  { title: "Grasses & strappy plants", blurb: "Mat-rushes, flax-lilies and tussock grasses for mass amenity planting.", href: "/encyclopedia?tag=GRASS", source: "encyclopedia", tag: "GRASS" },
  { title: "Feature & architectural", blurb: "Specimen plants with bold form for focal points and contemporary schemes.", href: "/encyclopedia?tag=FEATURE", source: "encyclopedia", tag: "FEATURE" },
  { title: "Screening & hedging", blurb: "Fast, dense species for privacy screens and clipped hedges — in stock by size.", href: "/plants?tag=SCREEN", source: "plants", tag: "SCREEN" },
  { title: "Advanced & specimen trees", blurb: "Mature stock in 100L–400L for instant impact and street-tree specs.", href: "/plants/pricelist", source: "plants", advanced: true },
];

async function enrich(g: Guide): Promise<Guide & { count: number; image?: string }> {
  if (g.source === "encyclopedia" && g.tag) {
    const rows = await db
      .select({ images: encyclopediaEntries.images })
      .from(encyclopediaEntries)
      .where(and(eq(encyclopediaEntries.status, "live"), sql`${encyclopediaEntries.tags}::jsonb @> ${JSON.stringify([g.tag])}::jsonb`));
    const image = rows.find((r) => (r.images as Array<{ url: string }>)?.[0]?.url)?.images as Array<{ url: string }> | undefined;
    return { ...g, count: rows.length, image: image?.[0]?.url };
  }
  // plants source
  const rows = await db
    .select({ images: plants.images, variants: plants.variants })
    .from(plants)
    .where(g.tag
      ? and(eq(plants.status, "live"), sql`${plants.tags}::jsonb @> ${JSON.stringify([g.tag])}::jsonb`)
      : eq(plants.status, "live"));
  const isAdvancedSize = (size: string) => {
    const m = /(\d+)(mm|L)/.exec(size);
    if (!m) return false;
    const n = parseInt(m[1]);
    return m[2] === "L" ? n >= 100 : n >= 400;
  };
  const filtered = g.advanced
    ? rows.filter((r) => (r.variants as Array<{ size: string }>)?.some((v) => isAdvancedSize(v.size)))
    : rows;
  const image = filtered.find((r) => (r.images as Array<{ url: string }>)?.[0]?.url)?.images as Array<{ url: string }> | undefined;
  return { ...g, count: filtered.length, image: image?.[0]?.url };
}

export default async function ResourcesPage() {
  const guides = await Promise.all(GUIDES.map(enrich));

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 40px 100px" }}>
      <div style={{ maxWidth: 760, marginBottom: 44 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent, #1f5a3d)", marginBottom: 12 }}>
          Plant selection guides
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "clamp(38px,5.5vw,64px)", letterSpacing: "-0.025em", margin: "0 0 16px", lineHeight: 1, color: "var(--ink, #133024)" }}>
          The right plant <span style={{ fontStyle: "italic", color: "var(--accent, #1f5a3d)" }}>for the brief.</span>
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--ink-2, #3c554a)" }}>
          Curated selections drawn from our plant encyclopedia and live nursery stock — built from
          three decades of specifying and growing for Sydney sites. Pick a palette to start, then
          drill into care notes, sizes and availability.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {guides.map((g) => (
          <a key={g.title} href={g.href} style={{ display: "block", textDecoration: "none", color: "inherit", border: "1px solid var(--line-2, rgba(19,48,36,0.12))", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
            <div style={{ aspectRatio: "16/10", background: "var(--bone, #f4efe4)", overflow: "hidden" }}>
              {g.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.image} alt={g.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : null}
            </div>
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 21, letterSpacing: "-0.01em", margin: 0, color: "var(--ink, #133024)" }}>{g.title}</h2>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent, #1f5a3d)", whiteSpace: "nowrap" }}>{g.count} →</span>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--ink-2, #3c554a)" }}>{g.blurb}</p>
            </div>
          </a>
        ))}
      </div>

      <div style={{ marginTop: 48, padding: "28px 32px", background: "var(--bone, #f4efe4)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 22, margin: "0 0 4px", color: "var(--ink, #133024)" }}>Need a plant schedule priced?</h3>
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-2, #3c554a)" }}>Build a list as you browse, then send it to us for trade rates and availability.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/encyclopedia" style={{ padding: "12px 22px", borderRadius: 999, background: "var(--ink, #133024)", color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Full encyclopedia →</a>
          <a href="/plants/pricelist" style={{ padding: "12px 22px", borderRadius: 999, background: "#fff", color: "var(--ink, #133024)", border: "1px solid var(--line-2, rgba(19,48,36,0.16))", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Trade pricelist</a>
        </div>
      </div>
    </div>
  );
}
