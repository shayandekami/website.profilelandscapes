"use client";

import { useState } from "react";

import type { PlantCare } from "@/lib/db/schema";

type EncyclopediaEntry =
  typeof import("@/lib/db/schema").encyclopediaEntries.$inferSelect;

const T = {
  ink: "#133024",
  sage: "#1f5a3d",
  moss: "#3c554a",
  ochre: "#c2783a",
  cream: "#e8dcb6",
  paper: "#faf6eb",
  line: "rgba(19,48,36,0.12)",
};

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// ── Season bar ────────────────────────────────────────────────────────────────
function SeasonBar({
  label,
  active,
  peak,
}: {
  label: string;
  active: number[];
  peak?: number[];
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center", marginBottom: 10 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.ink, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12,1fr)",
          height: 22,
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${T.line}`,
        }}
      >
        {MONTHS.map((_, i) => {
          const month = i + 1;
          const isPeak = peak?.includes(month);
          const isActive = active.includes(month);
          return (
            <span
              key={i}
              title={MONTHS[i]}
              style={{
                background: isPeak ? T.ochre : isActive ? T.sage : "#fff",
                display: "block",
                transition: "background 0.1s",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Companion card ────────────────────────────────────────────────────────────
function CompanionCard({ entry }: { entry: EncyclopediaEntry }) {
  const tags: string[] = (entry.tags as string[]) || [];
  const img = (entry.images as Array<{ url: string; alt?: string }>)?.[0];

  return (
    <a
      href={`/encyclopedia/${entry.slug}`}
      style={{
        background: "#fff",
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "block",
        textDecoration: "none",
        color: T.ink,
      }}
      onMouseEnter={(e) =>
        Object.assign((e.currentTarget as HTMLElement).style, {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 24px rgba(19,48,36,0.07)",
        })
      }
      onMouseLeave={(e) =>
        Object.assign((e.currentTarget as HTMLElement).style, {
          transform: "translateY(0)",
          boxShadow: "none",
        })
      }
    >
      <div style={{ height: 160, background: "#e8dcb6", overflow: "hidden" }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.url} alt={img.alt || entry.latinName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg viewBox="0 0 320 160" style={{ width: "100%", height: "100%", display: "block" }}>
            <rect width="100%" height="100%" fill="#e8dcb6" />
            <rect y="135" width="320" height="25" fill="#c2a875" />
            <g transform="translate(160,135)" stroke="#4a6b3a" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M 0 0 Q -6 -30 -12 -70" /><path d="M 0 0 Q 2 -35 5 -75" />
              <path d="M 0 0 Q -14 -25 -28 -60" /><path d="M 0 0 Q 14 -25 28 -60" />
            </g>
          </svg>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                style={{
                  background: tag === "NATIVE" ? T.sage : "rgba(19,48,36,0.07)",
                  color: tag === "NATIVE" ? "#fff" : T.moss,
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "2px 6px",
                  borderRadius: 3,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", color: T.sage, fontSize: 12, marginBottom: 3 }}>
          {entry.latinName}
        </div>
        <h4 style={{ margin: "0 0 0", fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 16, letterSpacing: "-0.005em", lineHeight: 1.2, color: T.ink }}>
          {entry.commonName || entry.latinName}
        </h4>
      </div>
    </a>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface EntryPageProps {
  entry: EncyclopediaEntry;
  companions: EncyclopediaEntry[];
}

// ── Main component ────────────────────────────────────────────────────────────
function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16 }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.sage, letterSpacing: "0.14em", fontWeight: 500 }}>{n}</span>
      <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 28, letterSpacing: "-0.015em", margin: 0, color: T.ink }}>
        {title}
      </h2>
    </div>
  );
}

export function EntryPage({ entry, companions }: EntryPageProps) {
  const tags: string[] = (entry.tags as string[]) || [];
  const care = entry.care as PlantCare | undefined;
  const seasons = entry.seasons as { flowering?: number[]; fruiting?: number[] } | undefined;
  const images = (entry.images as Array<{ url: string; alt?: string }>) || [];
  const climateZones = (entry.climateZones as string[]) || [];
  const cultivars = (entry.cultivars as Array<{ name: string; note: string }>) || [];
  const references = (entry.references as Array<{ title: string; source: string; url?: string }>) || [];
  const [activeImg, setActiveImg] = useState(0);

  const wrap: React.CSSProperties = { maxWidth: 1400, margin: "0 auto", padding: "0 56px" };

  return (
    <div style={{ background: "#faf6eb", color: T.ink, fontFamily: "'Inter Tight', sans-serif" }}>

      {/* ── BREADCRUMB ───────────────────────────────────────────────── */}
      <section style={{ ...wrap, paddingTop: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5d7363", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 28 }}>
          <a href="/encyclopedia" style={{ color: "#5d7363", textDecoration: "none" }}>Encyclopedia</a>
          {entry.family && <> · <span>{entry.family}</span></>}
          {" · "}
          <b style={{ color: T.ink }}>{entry.latinName}</b>
        </div>

        {/* ── HERO SECTION ───────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start", marginBottom: 60 }}>
          {/* Left: image */}
          <div>
            <div
              style={{
                background: "#e8e0c9",
                borderRadius: 8,
                overflow: "hidden",
                aspectRatio: "4/3",
                position: "relative",
              }}
            >
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImg]?.url || images[0].url}
                  alt={images[activeImg]?.alt || entry.latinName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <svg viewBox="0 0 600 450" style={{ width: "100%", height: "100%", display: "block" }}>
                  <rect width="100%" height="100%" fill="#e8dcb6" />
                  <rect y="400" width="600" height="50" fill="#c2a875" />
                  <g transform="translate(300,390)" stroke="#4a6b3a" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.9">
                    <path d="M 0 0 Q -25 -120 -55 -280" />
                    <path d="M 0 0 Q -12 -130 -18 -300" />
                    <path d="M 0 0 Q 6 -140 18 -300" />
                    <path d="M 0 0 Q 30 -120 60 -270" />
                    <path d="M 0 0 Q -45 -110 -90 -240" />
                    <path d="M 0 0 Q 45 -110 90 -240" />
                  </g>
                </svg>
              )}
            </div>
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 12 }}>
                {images.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      aspectRatio: "1",
                      border: `${i === activeImg ? "2px" : "1px"} solid ${i === activeImg ? T.ink : T.line}`,
                      borderRadius: 6,
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: hero text */}
          <div>
            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: tag === "NATIVE" ? T.sage : tag === "DROUGHT" ? T.ochre : "rgba(19,48,36,0.07)",
                      color: tag === "NATIVE" || tag === "DROUGHT" ? "#fff" : T.moss,
                      fontSize: 10.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: "4px 9px",
                      borderRadius: 3,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Latin name — hero size */}
            <div
              style={{
                fontFamily: "Fraunces, serif",
                fontStyle: "italic",
                color: T.sage,
                fontSize: "clamp(28px,3vw,40px)",
                letterSpacing: "-0.015em",
                lineHeight: 1.1,
                marginBottom: 10,
              }}
            >
              {entry.latinName}
            </div>

            {/* Common name */}
            {entry.commonName && (
              <h1
                style={{
                  fontFamily: "Fraunces, serif",
                  fontWeight: 400,
                  fontSize: "clamp(32px,4vw,52px)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.02,
                  margin: "0 0 8px",
                  color: T.ink,
                }}
              >
                {entry.commonName}
              </h1>
            )}

            {/* Family / genus */}
            {(entry.family || entry.genus) && (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a9489", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 22 }}>
                {[entry.genus, entry.family].filter(Boolean).join(" · ")}
              </div>
            )}

            {/* Description */}
            {entry.description && (
              <p style={{ fontSize: 16, lineHeight: 1.65, color: T.moss, marginBottom: 24 }}>
                {entry.description}
              </p>
            )}

            {/* In-stock link — links to nursery plant with matching encyclopedia slug */}
            <a
              href={`/plants?encyclopedia=${entry.slug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 22px",
                borderRadius: 999,
                background: T.ink,
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
            >
              In stock now →
            </a>
          </div>
        </div>
      </section>

      {/* ── CLASSIFICATION ───────────────────────────────────────────── */}
      {(entry.genus || entry.family || climateZones.length > 0) && (
        <section style={{ ...wrap, paddingBottom: 0, marginBottom: 60 }}>
          <SectionLabel n="02" title="Classification" />
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 60, alignItems: "start" }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", borderTop: `1px solid ${T.ink}` }}>
              {[
                { k: "Genus", v: entry.genus },
                { k: "Family", v: entry.family },
                { k: "Common name", v: entry.commonName },
                { k: "Climate", v: climateZones.length ? climateZones.join(", ") : null },
              ].map(({ k, v }) => v ? (
                <div key={k} style={{ display: "contents" }}>
                  <div style={{ padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: T.moss, letterSpacing: "0.12em", textTransform: "uppercase", background: "#fbf7ea", borderBottom: `1px solid ${T.line}` }}>
                    {k}
                  </div>
                  <div style={{ padding: "12px 14px", background: "#fff", fontSize: 14, color: T.ink, borderBottom: `1px solid ${T.line}`, textTransform: k === "Climate" ? "capitalize" : "none" }}>
                    {v}
                  </div>
                </div>
              ) : null)}
            </div>
            <div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: T.moss, margin: 0 }}>
                {entry.genus ? `${entry.latinName} belongs to the ${entry.genus} genus` : entry.latinName}
                {entry.family ? ` within the ${entry.family} family.` : "."}
                {climateZones.length > 0 && ` It performs reliably across ${climateZones.join(", ")} zones in our experience.`}
                {tags.includes("NATIVE") && " It is an Australian native we grow and specify regularly."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── CARE TABLE ───────────────────────────────────────────────── */}
      {care && (
        <section style={{ ...wrap, paddingBottom: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
            <div>
              <SectionLabel n="03" title="Cultivation" />
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 24px", color: T.ink }}>
                Care <span style={{ fontStyle: "italic", color: T.sage }}>sheet.</span>
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderTop: `1px solid ${T.ink}` }}>
                {[
                  { k: "Water", v: care.water },
                  { k: "Light", v: care.light },
                  { k: "Soil", v: care.soil },
                  { k: "Growth rate", v: care.growthRate },
                  { k: "Mature size", v: care.matureSize },
                ].map(({ k, v }) => v ? (
                  <div key={k} style={{ display: "contents" }}>
                    <div style={{ padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.moss, letterSpacing: "0.12em", textTransform: "uppercase", background: "#fbf7ea", borderBottom: `1px solid ${T.line}` }}>
                      {k}
                    </div>
                    <div style={{ padding: "14px 16px", background: "#fff", fontSize: 14, color: T.ink, borderBottom: `1px solid ${T.line}` }}>
                      {v}
                    </div>
                  </div>
                ) : null)}
              </div>
            </div>

            <div>
              {/* Pest notes */}
              {entry.pestNotes && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: T.sage, textTransform: "uppercase", marginBottom: 10 }}>
                    Pest & disease notes
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: T.moss, margin: 0 }}>
                    {entry.pestNotes}
                  </p>
                </div>
              )}

              {/* Propagation */}
              {entry.propagation && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: T.sage, textTransform: "uppercase", marginBottom: 10 }}>
                    Propagation
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: T.moss, margin: 0 }}>
                    {entry.propagation}
                  </p>
                </div>
              )}

              {/* Landscape use */}
              {entry.landscapeUse && (
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: T.sage, textTransform: "uppercase", marginBottom: 10 }}>
                    Landscape use
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: T.moss, margin: 0 }}>
                    {entry.landscapeUse}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── SEASON CHART ─────────────────────────────────────────────── */}
      {seasons && (
        <section style={{ ...wrap, marginTop: 60 }}>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 20px", color: T.ink }}>
            Through the <span style={{ fontStyle: "italic", color: T.sage }}>year.</span>
          </h3>

          {/* Month header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12,1fr)",
              gap: 2,
              border: `1px solid ${T.line}`,
              borderRadius: 6,
              overflow: "hidden",
              marginBottom: 12,
              background: T.line,
            }}
          >
            {MONTHS.map((m) => (
              <div
                key={m}
                style={{
                  background: "#fff",
                  padding: "8px 4px",
                  textAlign: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10.5,
                  color: T.moss,
                  letterSpacing: "0.08em",
                }}
              >
                {m}
              </div>
            ))}
          </div>

          {/* Bars */}
          <SeasonBar label="Foliage" active={[1,2,3,4,5,6,7,8,9,10,11,12]} />
          {seasons.flowering && (
            <SeasonBar
              label="Flowering"
              active={seasons.flowering}
              peak={seasons.flowering.slice(0, Math.ceil(seasons.flowering.length / 2))}
            />
          )}
          {seasons.fruiting && (
            <SeasonBar label="Fruiting" active={seasons.fruiting} />
          )}

          <div style={{ fontSize: 12, color: T.moss, marginTop: 10, display: "flex", gap: 18 }}>
            <span>
              <span style={{ display: "inline-block", width: 12, height: 12, background: T.ochre, borderRadius: 2, marginRight: 5, verticalAlign: "middle" }} />
              Peak
            </span>
            <span>
              <span style={{ display: "inline-block", width: 12, height: 12, background: T.sage, borderRadius: 2, marginRight: 5, verticalAlign: "middle" }} />
              Active
            </span>
          </div>
        </section>
      )}

      {/* ── CULTIVARS ────────────────────────────────────────────────── */}
      {cultivars.length > 0 && (
        <section style={{ ...wrap, marginTop: 60 }}>
          <SectionLabel n="04" title="Cultivars" />
          <p style={{ fontSize: 14.5, color: T.moss, margin: "0 0 24px", maxWidth: "60ch" }}>
            Selected named varieties and which job each is best suited to.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {cultivars.map((c, i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 8, padding: "20px 22px" }}>
                <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 18, color: T.sage, marginBottom: 8, letterSpacing: "-0.005em" }}>
                  {c.name}
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: T.moss }}>{c.note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── COMPANION PLANTS ─────────────────────────────────────────── */}
      {companions.length > 0 && (
        <section style={{ ...wrap, marginTop: 60, marginBottom: references.length > 0 ? 0 : 80 }}>
          <SectionLabel n="05" title="Companions" />
          <p style={{ fontSize: 14.5, color: T.moss, margin: "0 0 24px", maxWidth: "60ch" }}>
            Species we plant alongside {entry.commonName || entry.latinName}.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {companions.slice(0, 4).map((e) => (
              <CompanionCard key={e.id} entry={e} />
            ))}
          </div>
        </section>
      )}

      {/* ── FURTHER READING ──────────────────────────────────────────── */}
      {references.length > 0 && (
        <section style={{ ...wrap, marginTop: 60, marginBottom: 80 }}>
          <SectionLabel n="06" title="Further reading" />
          <ol style={{ listStyle: "none", padding: 0, margin: 0, borderTop: `1px solid ${T.line}`, maxWidth: 760 }}>
            {references.map((r, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 16, padding: "16px 0", borderBottom: `1px solid ${T.line}`, fontSize: 14 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.sage }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  {r.url ? (
                    <a href={r.url} style={{ color: T.ink, textDecoration: "none", borderBottom: `1px solid ${T.line}` }}>{r.title}</a>
                  ) : (
                    <span style={{ color: T.ink }}>{r.title}</span>
                  )}
                  <span style={{ color: T.moss }}> — {r.source}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
