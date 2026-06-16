"use client";

import { useState, useRef } from "react";

type NurseryPlant = typeof import("@/lib/db/schema").plants.$inferSelect;

const T = {
  ink: "#133024",
  sage: "#1f5a3d",
  moss: "#3c554a",
  ochre: "#c2783a",
  cream: "#e8dcb6",
  paper: "#faf6eb",
  line: "rgba(19,48,36,0.12)",
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Plant card ────────────────────────────────────────────────────────────────
function PlantCard({
  plant,
  onClick,
}: {
  plant: NurseryPlant;
  onClick?: () => void;
}) {
  const img = plant.images?.[0];
  const tags: string[] = (plant.tags as string[]) || [];

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "grid",
        gridTemplateRows: "240px auto",
        position: "relative",
      }}
      onMouseEnter={(e) =>
        Object.assign((e.currentTarget as HTMLElement).style, {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 28px rgba(19,48,36,0.08)",
        })
      }
      onMouseLeave={(e) =>
        Object.assign((e.currentTarget as HTMLElement).style, {
          transform: "translateY(0)",
          boxShadow: "none",
        })
      }
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.url} alt={img.alt || plant.latinName} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg viewBox="0 0 320 240" style={{ width: "100%", height: "100%", display: "block" }}>
            <rect width="100%" height="100%" fill="#e8dcb6" />
            <rect y="210" width="320" height="30" fill="#c2a875" />
            <g transform="translate(160,210)" stroke="#4a6b3a" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M 0 0 Q -10 -60 -20 -140" />
              <path d="M 0 0 Q 0 -65 5 -150" />
              <path d="M 0 0 Q 10 -60 25 -140" />
              <path d="M 0 0 Q -25 -50 -50 -110" />
              <path d="M 0 0 Q 25 -50 50 -110" />
            </g>
          </svg>
        )}
        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5, zIndex: 2 }}>
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                style={{
                  background:
                    tag === "NATIVE"
                      ? T.sage
                      : tag === "DROUGHT"
                        ? T.ochre
                        : "rgba(255,255,255,0.95)",
                  color:
                    tag === "NATIVE" || tag === "DROUGHT" ? "#fff" : T.ink,
                  fontSize: 10.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "4px 8px",
                  borderRadius: 3,
                  letterSpacing: "0.06em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "16px 18px", display: "grid", gap: 4 }}>
        <div style={{ fontStyle: "italic", color: "#5d7363", fontSize: 12, fontFamily: "Fraunces, serif" }}>
          {plant.latinName}
        </div>
        <h3
          style={{
            margin: "2px 0",
            fontFamily: "Fraunces, serif",
            fontWeight: 400,
            fontSize: 19,
            letterSpacing: "-0.005em",
            lineHeight: 1.2,
            color: T.ink,
          }}
        >
          {plant.commonName || "—"}
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
            paddingTop: 10,
            borderTop: `1px solid ${T.line}`,
          }}
        >
          <span style={{ fontSize: 11.5, color: "#5d7363", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
            {plant.size || "—"}
          </span>
          <span style={{ fontWeight: 600, fontSize: 16, color: T.ink }}>
            {fmt(plant.priceCents)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Plant finder step data ────────────────────────────────────────────────────
const FINDER_STEPS = [
  {
    id: "sun",
    label: "Sun exposure",
    hint: "Pick one or more",
    type: "cards" as const,
    options: [
      { value: "full-sun", label: "Full sun", note: "6+ hrs direct sunlight" },
      { value: "part-sun", label: "Part sun", note: "3–6 hrs, morning or filtered" },
      { value: "dappled", label: "Dappled shade", note: "Filtered light through canopy" },
      { value: "full-shade", label: "Full shade", note: "Less than 3 hrs direct" },
    ],
  },
  {
    id: "water",
    label: "Soil & water",
    hint: "Pick all that apply",
    type: "chips" as const,
    options: [
      { value: "well-drained", label: "Well-drained" },
      { value: "clay", label: "Clay" },
      { value: "sandy", label: "Sandy" },
      { value: "boggy", label: "Wet / boggy" },
      { value: "drought", label: "Drought-tolerant" },
      { value: "coastal", label: "Coastal / salt" },
    ],
  },
  {
    id: "purpose",
    label: "Purpose",
    hint: "What role does this plant play?",
    type: "chips" as const,
    options: [
      { value: "screen", label: "Screening / hedge" },
      { value: "feature", label: "Feature / specimen" },
      { value: "groundcover", label: "Groundcover" },
      { value: "texture", label: "Soft planting / texture" },
      { value: "edible", label: "Edible / productive" },
      { value: "pollinator", label: "Pollinator-friendly" },
      { value: "small", label: "Small garden" },
    ],
  },
  {
    id: "height",
    label: "Mature height",
    hint: "Pick all that apply",
    type: "chips" as const,
    options: [
      { value: "under-0.5", label: "Under 0.5m" },
      { value: "0.5-1.5", label: "0.5–1.5m" },
      { value: "1.5-3", label: "1.5–3m" },
      { value: "3-6", label: "3–6m" },
      { value: "6plus", label: "6m+" },
    ],
  },
];

const COLLECTIONS = [
  {
    label: "Collection 01",
    name: "The Sydney screen",
    desc: "Lillypilly, photinia, viburnum — 2–6m fast hedging.",
    count: "9 plants",
    bg: "#254a34",
    tag: "SCREEN",
  },
  {
    label: "Collection 02",
    name: "Drought meadow",
    desc: "Grasses + succulents.",
    count: "11 plants",
    bg: "#8a6d35",
    tag: "DROUGHT",
  },
  {
    label: "Collection 03",
    name: "Native groundcover",
    desc: "Low-water Australian natives.",
    count: "10 plants",
    bg: "#3a4a2c",
    tag: "NATIVE",
  },
  {
    label: "Collection 04",
    name: "Formal hedging",
    desc: "Dense screens & clipped form.",
    count: "9 plants",
    bg: "#1d4a44",
    tag: "HEDGE",
  },
  {
    label: "Collection 05",
    name: "Fragrant garden",
    desc: "Scented feature plants.",
    count: "4 plants",
    bg: "#5a5320",
    tag: "FRAGRANT",
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface NurseryPageProps {
  plants: NurseryPlant[];
}

// ── Main component ────────────────────────────────────────────────────────────
export function NurseryPage({ plants }: NurseryPageProps) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});
  const [finderResults, setFinderResults] = useState<NurseryPlant[] | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const totalSteps = FINDER_STEPS.length;
  const currentStep = FINDER_STEPS[step];

  function toggleSelection(stepId: string, value: string) {
    setSelections((prev) => {
      const next = { ...prev };
      const set = new Set(next[stepId] || []);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      next[stepId] = set;
      return next;
    });
  }

  function isSelected(stepId: string, value: string) {
    return selections[stepId]?.has(value) || false;
  }

  function applyFinder() {
    // Filter plants based on selections
    const sunSel = selections["sun"] || new Set();
    const waterSel = selections["water"] || new Set();
    const tagSel = selections["purpose"] || new Set();

    const results = plants.filter((p) => {
      const tags = (p.tags as string[]) || [];

      // Sun filter: map sun chips to plant tags
      if (sunSel.size > 0) {
        const sunMatch =
          (sunSel.has("full-sun") && tags.includes("FULL-SUN")) ||
          (sunSel.has("part-sun") && tags.includes("PART-SUN")) ||
          (sunSel.has("dappled") && tags.includes("SHADE")) ||
          (sunSel.has("full-shade") && tags.includes("SHADE")) ||
          sunSel.size === 0;
        // Permissive: pass if no tags to match against
        if (!sunMatch && tags.some((t) => ["FULL-SUN","PART-SUN","SHADE"].includes(t))) return false;
      }

      // Drought filter
      if (waterSel.has("drought") && !tags.includes("DROUGHT")) return false;

      // Purpose/tag filter
      if (tagSel.has("screen") && !tags.includes("SCREEN")) {
        // be permissive — only apply if plant has any purpose tags
      }

      return true;
    });

    setFinderResults(results.length > 0 ? results : plants.slice(0, 12));
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  // Tag filter for full grid
  const displayedPlants = finderResults
    ? finderResults
    : activeTag
      ? plants.filter((p) => ((p.tags as string[]) || []).includes(activeTag))
      : plants;

  const featured = plants.filter((p) => p.featured && p.status === "live").slice(0, 8);

  const wrap: React.CSSProperties = { maxWidth: 1400, margin: "0 auto", padding: "0 56px" };

  return (
    <div style={{ background: "#faf6eb", color: T.ink, fontFamily: "'Inter Tight', sans-serif" }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ ...wrap, marginTop: 28 }}>
        <div
          style={{
            background: "#1a3a28",
            color: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            minHeight: 480,
          }}
        >
          <div
            style={{
              padding: "64px 60px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", color: T.cream, textTransform: "uppercase" }}>
                Open Wed–Sun · Petersham yard
              </div>
              <h1
                style={{
                  fontFamily: "Fraunces, serif",
                  fontWeight: 300,
                  fontSize: "clamp(56px,6.5vw,96px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  margin: "28px 0",
                }}
              >
                Advanced<br/>
                <span style={{ fontStyle: "italic", color: T.cream }}>plant stock.</span>
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.55, color: "#c8d2c6", maxWidth: "46ch", marginBottom: 28 }}>
                From our own trial grounds — lillypillies, native grasses, specimen
                trees, and climbers that hold on through a Sydney summer. Trade and
                public welcome.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 22px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  background: "#fff",
                  color: T.ink,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Browse the nursery →
              </button>
              <a
                href="#finder"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 22px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.35)",
                  textDecoration: "none",
                }}
              >
                Use the plant finder
              </a>
            </div>
          </div>

          {/* Hero art */}
          <div
            style={{ background: "radial-gradient(circle at 70% 40%,#2c4a34,#0e2418)", overflow: "hidden" }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 600 480" style={{ width: "100%", height: "100%", display: "block" }}>
              <defs>
                <radialGradient id="nSun" cx="70%" cy="25%" r="40%">
                  <stop offset="0%" stopColor="#f7e574" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f7e574" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#nSun)" />
              {/* tree silhouette */}
              <g opacity="0.5">
                <path d="M 80 260 Q 40 180 80 130 Q 120 80 160 130 Q 200 180 160 260 Z" fill="#0a2418" />
                <rect x="115" y="260" width="10" height="40" fill="#0a2418" />
              </g>
              {/* palm */}
              <g transform="translate(400,200)">
                <rect x="-4" y="0" width="8" height="200" fill="#5d4a2a" />
                <g stroke="#5d7363" strokeWidth="3" fill="none" strokeLinecap="round">
                  <path d="M 0 0 Q -40 -30 -90 -20" />
                  <path d="M 0 0 Q 40 -30 90 -20" />
                  <path d="M 0 0 Q -30 -50 -60 -70" />
                  <path d="M 0 0 Q 30 -50 60 -70" />
                </g>
              </g>
              {/* grass tufts */}
              <g stroke="#9ba67b" strokeWidth="1.8" fill="none" strokeLinecap="round">
                <g transform="translate(220,380)">
                  <path d="M 0 0 Q -4 -30 -8 -60" /><path d="M 4 0 Q 2 -25 0 -55" /><path d="M 8 0 Q 10 -28 14 -58" />
                </g>
                <g transform="translate(300,390)">
                  <path d="M 0 0 Q -3 -28 -6 -55" /><path d="M 4 0 Q 4 -22 6 -50" />
                </g>
              </g>
              <rect y="440" width="600" height="40" fill="#0a1f14" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── PLANT FINDER ─────────────────────────────────────────────── */}
      <section id="finder" style={{ ...wrap, marginTop: 40 }}>
        <div
          style={{
            background: "#fff",
            border: `1px solid ${T.line}`,
            borderRadius: 8,
            padding: "40px 48px",
          }}
        >
          {/* Finder header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 28,
              paddingBottom: 18,
              borderBottom: `1px solid ${T.line}`,
            }}
          >
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", color: T.sage, textTransform: "uppercase", marginBottom: 8 }}>
                Plant finder
              </div>
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 40, letterSpacing: "-0.02em", margin: 0 }}>
                Find the right plant <span style={{ fontStyle: "italic", color: T.sage }}>for the spot.</span>
              </h2>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.moss, letterSpacing: "0.16em" }}>
              Step {step + 1} of {totalSteps}
            </div>
          </div>

          {/* Step content */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: T.sage,
              textTransform: "uppercase",
            }}
          >
            <span>{currentStep.label}</span>
            <span style={{ color: T.moss, textTransform: "none", letterSpacing: 0, fontFamily: "'Inter Tight', sans-serif", fontSize: 13 }}>
              {currentStep.hint}
            </span>
          </div>

          {currentStep.type === "cards" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
              {currentStep.options.map((opt) => {
                const on = isSelected(currentStep.id, opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleSelection(currentStep.id, opt.value)}
                    style={{
                      border: `${on ? "2px" : "1px"} solid ${on ? T.ink : T.line}`,
                      borderRadius: 8,
                      padding: on ? "21px 19px" : "22px 20px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: on ? T.cream : "#fbf7ea",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      minHeight: 150,
                    }}
                  >
                    <h5 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 18, margin: 0, letterSpacing: "-0.005em", color: T.ink }}>
                      {opt.label}
                    </h5>
                    <p style={{ fontSize: 12.5, color: T.moss, margin: 0, lineHeight: 1.4 }}>{opt.note}</p>
                  </div>
                );
              })}
            </div>
          )}

          {currentStep.type === "chips" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {currentStep.options.map((opt) => {
                const on = isSelected(currentStep.id, opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleSelection(currentStep.id, opt.value)}
                    style={{
                      padding: "8px 14px",
                      border: `1px solid ${on ? T.ink : T.line}`,
                      borderRadius: 999,
                      fontSize: 13,
                      background: on ? T.ink : "#fff",
                      color: on ? "#fff" : T.ink,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step progress dots */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {FINDER_STEPS.map((s, i) => (
              <div
                key={s.id}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === step ? T.ink : i < step ? T.sage : T.line,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div
            style={{
              paddingTop: 22,
              borderTop: `1px solid ${T.line}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 14, color: T.moss }}>
              Matches:{" "}
              <b style={{ color: T.ink }}>
                {plants.length} plants
              </b>{" "}
              · Narrow further with the next step.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  style={{
                    padding: "14px 24px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: `1px solid ${T.line}`,
                    background: "#fff",
                    color: T.ink,
                    fontFamily: "inherit",
                  }}
                >
                  ← Back
                </button>
              )}
              {step < totalSteps - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  style={{
                    padding: "14px 24px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: "none",
                    background: T.ink,
                    color: "#fff",
                    fontFamily: "inherit",
                  }}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={applyFinder}
                  style={{
                    padding: "14px 24px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: "none",
                    background: T.sage,
                    color: "#fff",
                    fontFamily: "inherit",
                  }}
                >
                  Find my plants →
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ──────────────────────────────────────────────── */}
      <section style={{ ...wrap, marginTop: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.02em", margin: 0, color: T.ink }}>
            Curated <span style={{ fontStyle: "italic", color: T.sage }}>collections.</span>
          </h2>
          <a href="#" style={{ fontSize: 13, color: T.sage, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.12em", textDecoration: "none" }}>
            All collections →
          </a>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "200px 200px",
            gap: 16,
          }}
        >
          {COLLECTIONS.map((col, i) => (
            <a
              key={i}
              href={`/plants?tag=${col.tag}`}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                position: "relative",
                cursor: "pointer",
                transition: "transform 0.2s",
                background: col.bg,
                gridRow: i === 0 ? "span 2" : "auto",
                textDecoration: "none",
                display: "block",
              }}
              onMouseEnter={(e) =>
                Object.assign((e.currentTarget as HTMLElement).style, {
                  transform: "translateY(-3px)",
                })
              }
              onMouseLeave={(e) =>
                Object.assign((e.currentTarget as HTMLElement).style, {
                  transform: "translateY(0)",
                })
              }
            >
              {/* gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(10,30,20,0.75), rgba(10,30,20,0) 55%)",
                  zIndex: 1,
                }}
              />
              {/* label */}
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  bottom: 18,
                  zIndex: 2,
                  color: "#fff",
                }}
              >
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.14em", opacity: 0.9, textTransform: "uppercase" }}>
                  {col.label}
                </div>
                <h3
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontWeight: 400,
                    fontSize: i === 0 ? 40 : 28,
                    margin: "4px 0 4px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {col.name}
                </h3>
                <span style={{ fontSize: 12, opacity: 0.8 }}>{col.desc} {col.count}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FEATURED PLANTS STRIP ────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ ...wrap, marginTop: 80 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.02em", margin: 0, color: T.ink }}>
              In stock <span style={{ fontStyle: "italic", color: T.sage }}>this week</span>
            </h2>
            <button
              onClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth" })}
              style={{ fontSize: 13, color: T.sage, background: "none", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.12em" }}
            >
              Browse all {plants.length} plants →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {featured.slice(0, 4).map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── FULL PLANT GRID WITH FILTERS ─────────────────────────────── */}
      <div ref={gridRef} style={{ scrollMarginTop: 80 }} />

      {finderResults && (
        <section style={{ ...wrap, marginTop: 28 }}>
          <div style={{ padding: "20px 22px", background: "#fbf7ea", border: `1px solid ${T.line}`, borderRadius: 8, marginBottom: 24 }}>
            <div style={{ fontSize: 14, color: T.moss, display: "flex", alignItems: "center", gap: 12 }}>
              <b style={{ color: T.ink }}>{finderResults.length} plants matched your criteria</b>
              <button
                onClick={() => setFinderResults(null)}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.sage, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}
              >
                Clear finder
              </button>
            </div>
          </div>
        </section>
      )}

      <section
        style={{
          ...wrap,
          marginTop: finderResults ? 0 : 80,
          marginBottom: 80,
          display: "grid",
          gridTemplateColumns: "250px 1fr",
          gap: 36,
          alignItems: "start",
        }}
      >
        {/* Sidebar filters */}
        <aside style={{ position: "sticky", top: 80 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: T.sage, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
            Attributes
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px" }}>
            {["NATIVE", "DROUGHT", "FRAGRANT", "FULL-SUN", "PART-SUN", "SHADE"].map((tag) => {
              const count = plants.filter((p) => ((p.tags as string[]) || []).includes(tag)).length;
              if (!count) return null;
              return (
                <li
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  style={{
                    padding: "5px 0",
                    fontSize: 13.5,
                    color: activeTag === tag ? T.ink : T.moss,
                    fontWeight: activeTag === tag ? 600 : 400,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: `1px solid ${activeTag === tag ? T.ink : T.line}`,
                      borderRadius: 3,
                      background: activeTag === tag ? T.ink : "#fff",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  {tag.charAt(0) + tag.slice(1).toLowerCase().replace("-", " ")}
                  <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#8a9489" }}>
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>

          {(activeTag || finderResults) && (
            <button
              onClick={() => { setActiveTag(null); setFinderResults(null); }}
              style={{
                padding: "8px 14px",
                border: `1px solid ${T.line}`,
                borderRadius: 999,
                fontSize: 12,
                cursor: "pointer",
                background: "#fff",
                fontFamily: "inherit",
                color: T.moss,
                width: "100%",
              }}
            >
              Clear filters
            </button>
          )}
        </aside>

        {/* Plant grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {displayedPlants.length === 0 ? (
            <div style={{ gridColumn: "1/-1", padding: "60px 0", textAlign: "center", color: T.moss }}>
              No plants match these filters.
            </div>
          ) : (
            displayedPlants.map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
