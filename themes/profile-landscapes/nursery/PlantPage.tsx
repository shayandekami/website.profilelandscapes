"use client";

import { useState } from "react";

import type { PlantCare } from "@/lib/db/schema";
import { addToCart } from "@/lib/buyCart";
import { addToQuote } from "@/lib/quoteCart";

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

// ── Season chart ──────────────────────────────────────────────────────────────
function SeasonBar({
  label,
  active,
  peak,
}: {
  label: string;
  active: number[];
  peak?: number[];
}) {
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
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
        {months.map((_, i) => {
          const month = i + 1;
          const isPeak = peak?.includes(month);
          const isActive = active.includes(month);
          return (
            <span
              key={i}
              style={{
                background: isPeak ? T.ochre : isActive ? T.sage : "#fff",
                display: "block",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Companion plant card ──────────────────────────────────────────────────────
function CompanionCard({ plant }: { plant: NurseryPlant }) {
  const img = plant.images?.[0];
  return (
    <a
      href={`/plants/${plant.slug}`}
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
      <div style={{ height: 180, background: "#e8dcb6", overflow: "hidden" }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.url} alt={img.alt || plant.latinName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg viewBox="0 0 320 180" style={{ width: "100%", height: "100%", display: "block" }}>
            <rect width="100%" height="100%" fill="#e8dcb6" />
            <rect y="150" width="320" height="30" fill="#c2a875" />
            <g transform="translate(160,150)" stroke="#4a6b3a" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M 0 0 Q -8 -40 -15 -100" />
              <path d="M 0 0 Q 2 -45 5 -110" />
              <path d="M 0 0 Q -18 -35 -35 -80" />
              <path d="M 0 0 Q 18 -35 35 -80" />
            </g>
          </svg>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontStyle: "italic", color: "#5d7363", fontSize: 11, fontFamily: "Fraunces, serif" }}>
          {plant.latinName}
        </div>
        <h4 style={{ margin: "2px 0 6px", fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 17, letterSpacing: "-0.005em", color: T.ink }}>
          {plant.commonName || "—"}
        </h4>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 14 }}>
          {fmt(plant.priceCents)}
        </div>
      </div>
    </a>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface PlantPageProps {
  plant: NurseryPlant;
  companions: NurseryPlant[];
}

// ── Main component ────────────────────────────────────────────────────────────
export function PlantPage({ plant, companions }: PlantPageProps) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [quoted, setQuoted] = useState(false);
  const [favoured, setFavoured] = useState(false);

  const inStock = plant.stockQty > 0;
  const images = plant.images?.length ? plant.images : [];
  const tags: string[] = (plant.tags as string[]) || [];
  const care = plant.care as PlantCare | undefined;
  const seasons = plant.seasons as { flowering?: number[]; fruiting?: number[] } | undefined;

  // Pot-size variants (size → price). Falls back to the single representative price.
  const variants = (plant.variants as Array<{ size: string; priceCents: number }>) || [];
  const [vIdx, setVIdx] = useState(0);
  const activePrice = variants.length ? variants[Math.min(vIdx, variants.length - 1)].priceCents : plant.priceCents;
  const activeSize = variants.length ? variants[Math.min(vIdx, variants.length - 1)].size : plant.size;

  function handleAdd() {
    if (!inStock) return;
    addToCart({
      type: "plant",
      id: plant.id,
      name: plant.commonName ? `${plant.commonName} (${plant.latinName})` : plant.latinName,
      image: images[0]?.url,
      priceCents: activePrice,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  function handleQuote() {
    addToQuote({
      kind: "plant",
      slug: plant.slug,
      name: plant.commonName ? `${plant.commonName} (${plant.latinName})` : plant.latinName,
      size: activeSize || undefined,
      priceCents: inStock ? activePrice : 0,
      qty,
    });
    setQuoted(true);
    setTimeout(() => setQuoted(false), 1600);
  }

  const wrap: React.CSSProperties = { maxWidth: 1400, margin: "0 auto", padding: "0 56px" };

  return (
    <div style={{ background: "#faf6eb", color: T.ink, fontFamily: "'Inter Tight', sans-serif" }}>

      {/* Breadcrumb */}
      <section style={{ ...wrap, paddingTop: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5d7363", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>
          <a href="/nursery" style={{ color: "#5d7363", textDecoration: "none" }}>Nursery</a>
          {" · "}
          <b style={{ color: T.ink }}>{plant.commonName || plant.latinName}</b>
        </div>

        {/* Two-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 56, alignItems: "start" }}>

          {/* Gallery */}
          <div>
            {/* Main image */}
            <div
              style={{
                background: "#e8e0c9",
                borderRadius: 8,
                overflow: "hidden",
                aspectRatio: "4/5",
                position: "relative",
              }}
            >
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImg]?.url || images[0].url}
                  alt={images[activeImg]?.alt || plant.latinName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <svg viewBox="0 0 500 625" style={{ width: "100%", height: "100%", display: "block" }}>
                  <rect width="100%" height="100%" fill="#e8dcb6" />
                  <rect y="560" width="500" height="65" fill="#c2a875" />
                  <g transform="translate(250,550)" stroke="#4a6b3a" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.95">
                    <path d="M 0 0 Q -20 -150 -45 -340" />
                    <path d="M 0 0 Q -10 -160 -15 -360" />
                    <path d="M 0 0 Q 5 -170 15 -370" />
                    <path d="M 0 0 Q 25 -150 50 -340" />
                    <path d="M 0 0 Q -35 -140 -75 -300" />
                    <path d="M 0 0 Q 35 -140 70 -310" />
                  </g>
                  <text x="250" y="610" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16" fill="#5d7363">
                    {plant.latinName}
                  </text>
                </svg>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 14,
                  background: "rgba(19,48,36,0.85)",
                  color: "#fff",
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.1em",
                }}
              >
                Click image to zoom
              </div>
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

          {/* Product info */}
          <div>
            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: tag === "NATIVE" ? T.sage : tag === "DROUGHT" ? T.ochre : "rgba(19,48,36,0.08)",
                      color: tag === "NATIVE" || tag === "DROUGHT" ? "#fff" : T.ink,
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

            <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", color: T.sage, fontSize: 16 }}>
              {plant.latinName}
            </div>
            <h1
              style={{
                fontFamily: "Fraunces, serif",
                fontWeight: 400,
                fontSize: "clamp(38px,4vw,56px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.02,
                margin: "6px 0 14px",
                color: T.ink,
              }}
            >
              {plant.commonName || plant.latinName}
            </h1>
            {plant.shortDescription && (
              <p style={{ fontSize: 15, color: T.moss, lineHeight: 1.5, margin: "0 0 22px", maxWidth: "50ch" }}>
                {plant.shortDescription}
              </p>
            )}

            {/* Quick facts */}
            {care && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  borderTop: `1px solid ${T.line}`,
                  borderBottom: `1px solid ${T.line}`,
                  marginBottom: 24,
                }}
              >
                {[
                  { k: "Size", v: care.matureSize || plant.size || "—" },
                  { k: "Water", v: care.water || "—" },
                  { k: "Light", v: care.light || "—" },
                  { k: "Growth", v: care.growthRate || "—" },
                ].map((f, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 14px",
                      borderRight: i < 3 ? `1px solid ${T.line}` : "none",
                    }}
                  >
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.12em", color: T.moss, textTransform: "uppercase", marginBottom: 4 }}>
                      {f.k}
                    </div>
                    <div style={{ fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 400, color: T.ink }}>
                      {f.v}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 24,
              }}
            >
              <div>
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink }}>
                  {fmt(activePrice)}{" "}
                  <small style={{ fontSize: 14, color: T.moss, fontWeight: 400, fontFamily: "'Inter Tight', sans-serif" }}>
                    / {activeSize || "per plant"} (inc. GST)
                  </small>
                </div>
              </div>
              <div
                style={{
                  color: inStock ? T.sage : T.ochre,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: inStock ? T.sage : T.ochre,
                    display: "inline-block",
                  }}
                />
                {inStock ? `${plant.stockQty} in stock` : "Out of stock"}
              </div>
            </div>

            {/* Pot size selector */}
            {variants.length > 1 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#5d7363", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                  Pot size: <span style={{ color: T.ink }}>{activeSize}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setVIdx(i)}
                      style={{
                        padding: "9px 14px",
                        border: `1px solid ${i === vIdx ? T.ink : T.line}`,
                        background: i === vIdx ? T.ink : "#fff",
                        color: i === vIdx ? "#fff" : T.ink,
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        gap: 8,
                        alignItems: "baseline",
                      }}
                    >
                      <span>{v.size}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, opacity: 0.8 }}>{fmt(v.priceCents)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add to cart */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, marginBottom: 14, alignItems: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: `1px solid ${T.line}`,
                  borderRadius: 6,
                  background: "#fff",
                }}
              >
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{ width: 38, height: 50, background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: T.ink }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: 40, height: 50, textAlign: "center", border: "none", background: "transparent", fontSize: 15, fontWeight: 500, fontFamily: "inherit", color: T.ink }}
                />
                <button
                  onClick={() => setQty(qty + 1)}
                  style={{ width: 38, height: 50, background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: T.ink }}
                >
                  +
                </button>
              </div>

              {inStock ? (
                <button
                  onClick={handleAdd}
                  style={{
                    background: added ? T.sage : T.ink,
                    color: "#fff",
                    border: "none",
                    padding: 17,
                    borderRadius: 999,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.18s",
                  }}
                >
                  {added ? "Added to cart ✓" : `Add to cart · ${fmt(activePrice * qty)}`}
                </button>
              ) : (
                <button
                  onClick={handleQuote}
                  style={{
                    background: quoted ? T.sage : T.ochre,
                    color: "#fff",
                    border: "none",
                    padding: 17,
                    borderRadius: 999,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.18s",
                  }}
                >
                  {quoted ? "Added to quote ✓" : "Request a quote — grown to order"}
                </button>
              )}

              <button
                onClick={() => setFavoured((f) => !f)}
                aria-label="Save"
                style={{
                  width: 50,
                  height: 50,
                  border: `1px solid ${favoured ? T.ink : T.line}`,
                  borderRadius: 999,
                  background: favoured ? T.cream : "#fff",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  transition: "all 0.15s",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={favoured ? T.ink : "none"}>
                  <path d="M 12 20 L 4 12 Q 0 6 6 4 Q 10 4 12 8 Q 14 4 18 4 Q 24 6 20 12 Z" stroke={T.ink} strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            {/* Trade quote option (in-stock items) */}
            {inStock && (
              <button
                onClick={handleQuote}
                style={{
                  marginBottom: 4,
                  background: "transparent",
                  border: "none",
                  color: quoted ? T.sage : T.moss,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {quoted ? "Added to quote ✓" : "Trade or bulk order? Add to a quote request instead →"}
              </button>
            )}

            {/* Shipping info */}
            <div
              style={{
                marginTop: 18,
                padding: "18px 20px",
                background: "#fbf7ea",
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                { title: "Yard pickup", body: "16 New Canterbury Rd, Petersham. Ready same day." },
                { title: "Sydney delivery", body: "$85 flat, delivered on our trucks within 48hrs." },
                { title: "Plant health guarantee", body: "Replace or refund within 60 days." },
                { title: "Planting service", body: "Installed and mulched on request." },
              ].map((s, i) => (
                <div key={i}>
                  <h5 style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 500, color: T.ink }}>{s.title}</h5>
                  <p style={{ margin: 0, color: T.moss, fontSize: 12.5, lineHeight: 1.45 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CARE SECTION ─────────────────────────────────────────────── */}
      {(plant.description || care) && (
        <section style={{ ...wrap, marginTop: 60 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
            {plant.description && (
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", color: T.sage, textTransform: "uppercase", marginBottom: 12 }}>
                  On the plant
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", margin: "0 0 20px", color: T.ink }}>
                  Why we <span style={{ fontStyle: "italic", color: T.sage }}>specify it.</span>
                </h2>
                <p style={{ fontSize: 15.5, lineHeight: 1.65, color: T.moss }}>
                  {plant.description}
                </p>
              </div>
            )}
            {care && (
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", color: T.sage, textTransform: "uppercase", marginBottom: 12 }}>
                  Growing conditions
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", margin: "0 0 20px", color: T.ink }}>
                  Care <span style={{ fontStyle: "italic", color: T.sage }}>sheet.</span>
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderTop: `1px solid ${T.ink}` }}>
                  {Object.entries({
                    Sun: care.light,
                    Soil: care.soil,
                    Water: care.water,
                    "Growth rate": care.growthRate,
                    "Mature size": care.matureSize,
                  }).map(([k, v]) => v ? (
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
            )}
          </div>
        </section>
      )}

      {/* ── SEASONS CHART ─────────────────────────────────────────────── */}
      {seasons && (
        <section style={{ ...wrap, marginTop: 60 }}>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 20px", color: T.ink }}>
            Through the <span style={{ fontStyle: "italic", color: T.sage }}>year.</span>
          </h3>
          {/* Month header */}
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
            {["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"].map((m) => (
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

          {/* Foliage — evergreen: always active */}
          <SeasonBar label="Foliage" active={[1,2,3,4,5,6,7,8,9,10,11,12]} />

          {seasons.flowering && (
            <SeasonBar label="Flower" active={seasons.flowering} peak={seasons.flowering?.slice(0, 2)} />
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

      {/* ── COMPANION PLANTS ─────────────────────────────────────────── */}
      {companions.length > 0 && (
        <section style={{ ...wrap, marginTop: 60, marginBottom: 80 }}>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 32, letterSpacing: "-0.02em", margin: "0 0 24px", color: T.ink }}>
            Pair it <span style={{ fontStyle: "italic", color: T.sage }}>with.</span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {companions.slice(0, 4).map((p) => (
              <CompanionCard key={p.id} plant={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
