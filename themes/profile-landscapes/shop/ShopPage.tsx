"use client";

import { useState, useEffect, useCallback } from "react";
import { addToCart } from "@/lib/buyCart";

// ── Types inferred from schema ──────────────────────────────────────────────
type Product = typeof import("@/lib/db/schema").products.$inferSelect;
type ProductCategory =
  typeof import("@/lib/db/schema").productCategories.$inferSelect;

// ── Design tokens ───────────────────────────────────────────────────────────
const T = {
  ink: "#133024",
  sage: "#1f5a3d",
  moss: "#3c554a",
  cream: "#f5efdc",
  paper: "#faf6eb",
  ochre: "#c2783a",
  line: "rgba(19,48,36,0.12)",
  bg: "#faf6eb",
  cardBg: "#fff",
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Add-to-cart button ──────────────────────────────────────────────────────
function AddToCartButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({
      type: "product",
      id: product.id,
      name: product.name,
      image: product.images?.[0]?.url,
      priceCents: product.priceCents,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const inStock = product.stockQty > 0;
  return (
    <button
      onClick={handleAdd}
      disabled={!inStock}
      className={className}
      style={{
        background: added ? T.sage : inStock ? T.ink : "#a0a8a0",
        color: "#fff",
        border: "none",
        padding: "10px 16px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        cursor: inStock ? "pointer" : "not-allowed",
        fontFamily: "inherit",
        transition: "background 0.18s",
        width: "100%",
      }}
    >
      {added ? "Added ✓" : inStock ? "Add to cart" : "Out of stock"}
    </button>
  );
}

// ── Product card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  category,
}: {
  product: Product;
  category?: ProductCategory;
}) {
  const hasCompare =
    product.compareAtCents && product.compareAtCents > product.priceCents;
  const badgeStyle: React.CSSProperties = {
    position: "absolute",
    top: 12,
    left: 12,
    background:
      product.badge === "SALE"
        ? T.ochre
        : product.badge
          ? T.ink
          : "transparent",
    color: "#fff",
    fontSize: 10.5,
    fontFamily: "'JetBrains Mono', monospace",
    padding: "4px 8px",
    borderRadius: 3,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    display: product.badge ? "block" : "none",
  };

  const img = product.images?.[0];

  return (
    <div
      style={{
        background: T.cardBg,
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        display: "grid",
        gridTemplateRows: "260px auto",
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
      {/* Image area */}
      <div
        style={{
          background: "#f3ecd9",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.alt || product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <svg
            viewBox="0 0 320 260"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <rect width="100%" height="100%" fill="#e8e0c9" />
            {/* Stylised shopping bag placeholder */}
            <g transform="translate(160,115)" stroke="#6b7c6a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="-34" y="-24" width="68" height="58" rx="3" fill="#d8cdb0" stroke="#6b7c6a"/>
              <path d="M -18 -24 Q -18 -46 0 -46 Q 18 -46 18 -24" />
              <line x1="-10" y1="6" x2="10" y2="6" strokeWidth="1.5" stroke="#8a9489"/>
            </g>
            <text
              x="160"
              y="204"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontSize="12"
              fill="#8a9489"
              letterSpacing="0.5"
            >
              {product.name.length > 28 ? product.name.slice(0, 27) + "…" : product.name}
            </text>
          </svg>
        )}
        {product.badge && <div style={badgeStyle}>{product.badge}</div>}
        {/* Fav button */}
        <button
          onClick={(e) => e.stopPropagation()}
          aria-label="Save"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#fff",
            border: `1px solid ${T.line}`,
            borderRadius: 999,
            width: 34,
            height: 34,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M 12 20 L 4 12 Q 0 6 6 4 Q 10 4 12 8 Q 14 4 18 4 Q 24 6 20 12 Z"
              stroke={T.ink}
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px" }}>
        {category && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5,
              color: "#5d7363",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {category.name}
          </div>
        )}
        <h3
          style={{
            margin: "4px 0 6px",
            fontFamily: "Fraunces, serif",
            fontWeight: 400,
            fontSize: 18,
            letterSpacing: "-0.005em",
            lineHeight: 1.2,
            color: T.ink,
          }}
        >
          {product.name}
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: T.ink,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {hasCompare && (
              <s
                style={{
                  color: "#8a9489",
                  fontWeight: 400,
                  fontSize: 13,
                  marginRight: 6,
                }}
              >
                {formatPrice(product.compareAtCents!)}
              </s>
            )}
            {formatPrice(product.priceCents)}
          </div>
          <div style={{ fontSize: 12, color: "#5d7363" }}>
            <span style={{ color: T.ochre }}>★★★★★</span>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}

// ── Category card ─────────────────────────────────────────────────────────────
const CAT_ARTWORKS = [
  // workwear
  <svg key={0} viewBox="0 0 300 180" style={{ width: "100%", height: "100%", display: "block" }}>
    <rect width="100%" height="100%" fill="#e5da7a" />
    <g transform="translate(85,30)">
      <path d="M 50 10 L 100 10 L 118 30 L 98 42 L 98 150 L 22 150 L 22 42 L 2 30 Z" fill="#f7e574" stroke="#113021" strokeWidth="2" />
      <rect x="24" y="80" width="72" height="8" fill="#c2783a" />
      <rect x="24" y="110" width="72" height="8" fill="#c2783a" />
    </g>
  </svg>,
  // gloves
  <svg key={1} viewBox="0 0 300 180" style={{ width: "100%", height: "100%", display: "block" }}>
    <rect width="100%" height="100%" fill="#c9a87c" />
    <g transform="translate(100,45)">
      <path d="M 10 40 Q 0 30 10 18 L 10 5 Q 15 0 25 0 L 25 18 L 40 18 L 40 0 Q 47 -5 55 0 L 55 22 L 70 22 L 70 3 Q 78 0 85 5 L 85 30 L 95 30 Q 102 36 95 48 L 95 95 Q 50 102 10 95 Z" fill="#6b4423" stroke="#3a2817" strokeWidth="2" />
    </g>
  </svg>,
  // tools
  <svg key={2} viewBox="0 0 300 180" style={{ width: "100%", height: "100%", display: "block" }}>
    <rect width="100%" height="100%" fill="#cbd7b8" />
    <g transform="translate(50,40)">
      <circle cx="25" cy="40" r="10" fill="none" stroke="#113021" strokeWidth="3" />
      <circle cx="55" cy="40" r="10" fill="none" stroke="#113021" strokeWidth="3" />
      <path d="M 40 45 L 170 110 L 180 98" stroke="#c2783a" strokeWidth="5" fill="none" />
    </g>
  </svg>,
  // household
  <svg key={3} viewBox="0 0 300 180" style={{ width: "100%", height: "100%", display: "block" }}>
    <rect width="100%" height="100%" fill="#d9c9a1" />
    <g transform="translate(60,40)">
      <rect x="0" y="70" width="180" height="10" fill="#8a5a35" />
      <rect x="20" y="40" width="40" height="40" fill="#c2783a" />
      <circle cx="150" cy="55" r="22" fill="#113021" />
      <circle cx="150" cy="55" r="12" fill="#c2783a" />
    </g>
  </svg>,
];

// ── Shop by trade ──────────────────────────────────────────────────────────────
const TRADE_SETS = [
  { n: "01", title: "Apprentice starter", body: "First-day pack: boots, gloves, white card kit, basic hand tools.", count: "12 items · from $320", slug: "workwear" },
  { n: "02", title: "Landscaper", body: "All-season workwear, hi-vis, shovel, rake, secateurs.", count: "18 items · from $480", slug: "tools" },
  { n: "03", title: "Horticulturist", body: "Pruning set, soil testing, plant tags, field notebook.", count: "14 items · from $260", slug: "tools" },
  { n: "04", title: "Foreman", body: "Hi-vis polo range, clipboards, laser levels, radios.", count: "20 items · from $640", slug: "workwear" },
  { n: "05", title: "Weekend gardener", body: "Raised-bed kit, hand tools, gloves, trug, kneeler.", count: "10 items · from $180", slug: "household" },
];

function ShopByTrade({ onPick }: { onPick: (slug: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
      {TRADE_SETS.map((set) => (
        <div
          key={set.n}
          onClick={() => onPick(set.slug)}
          style={{
            background: "#fff",
            border: `1px solid ${T.line}`,
            borderRadius: 8,
            padding: "26px 22px 22px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            transition: "transform 0.2s, box-shadow 0.2s",
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
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.ochre, letterSpacing: "0.1em" }}>
            {set.n}
          </div>
          <h4 style={{ margin: 0, fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 19, letterSpacing: "-0.01em", lineHeight: 1.15, color: T.ink }}>
            {set.title}
          </h4>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: T.moss, flex: 1 }}>
            {set.body}
          </p>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#5d7363", letterSpacing: "0.08em", textTransform: "uppercase", paddingTop: 8, borderTop: `1px solid ${T.line}` }}>
            {set.count}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Trust band ────────────────────────────────────────────────────────────────
function TrustBand() {
  const items = [
    { icon: "🛡", title: "Trade-tested gear", body: "Used on our own sites before we stock it." },
    { icon: "🚚", title: "Free Sydney delivery", body: "On orders over $150. Pickup in Petersham." },
    { icon: "↩", title: "30-day returns", body: "Unused in original packaging." },
    { icon: "🏷", title: "Trade accounts", body: "Nett 30 terms, bulk pricing, named rep." },
  ];
  return (
    <div
      style={{
        background: "#ece6d5",
        borderTop: `1px solid ${T.line}`,
        borderBottom: `1px solid ${T.line}`,
        padding: "28px 56px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              padding: "6px 22px",
              borderRight: i < 3 ? `1px solid ${T.line}` : "none",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ fontSize: 22 }}>{it.icon}</span>
            <div>
              <h5 style={{ margin: 0, fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 16 }}>
                {it.title}
              </h5>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: T.moss, lineHeight: 1.45 }}>
                {it.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ShopPageProps {
  products: Product[];
  categories: ProductCategory[];
  selectedCategory?: string;
  searchQuery?: string;
}

// ── Main component ────────────────────────────────────────────────────────────
export function ShopPage({
  products,
  categories,
  selectedCategory,
  searchQuery,
}: ShopPageProps) {
  const [activeCat, setActiveCat] = useState<string | undefined>(selectedCategory);
  const [search, setSearch] = useState(searchQuery || "");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");

  // Build category map
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  // Filter + sort products
  const filtered = products
    .filter((p) => {
      if (p.status !== "live") return false;
      if (activeCat) {
        const cat = categories.find((c) => c.slug === activeCat);
        if (cat && p.categoryId !== cat.id) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.priceCents - b.priceCents;
      if (sortBy === "price-desc") return b.priceCents - a.priceCents;
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  const featured = products.filter((p) => p.featured && p.status === "live").slice(0, 4);
  const isHome = !activeCat && !search;

  const wrap: React.CSSProperties = { maxWidth: 1400, margin: "0 auto", padding: "0 56px" };

  return (
    <div style={{ background: T.bg, color: T.ink, fontFamily: "'Inter Tight', sans-serif", minHeight: "100vh" }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      {isHome && (
        <section style={{ ...wrap, marginTop: 28, paddingTop: 0 }}>
          <div
            style={{
              background: "#113021",
              color: "#fff",
              borderRadius: 8,
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              minHeight: 460,
            }}
          >
            <div
              style={{
                padding: "60px 56px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    color: "#e8dcb6",
                    textTransform: "uppercase",
                  }}
                >
                  Winter &apos;26 · Now shipping
                </div>
                <h1
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontWeight: 300,
                    fontSize: "clamp(52px,6vw,88px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.03em",
                    margin: "28px 0",
                  }}
                >
                  The field{" "}
                  <span style={{ fontStyle: "italic", color: "#e8dcb6" }}>shop.</span>
                </h1>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: "#c8c2b0",
                    maxWidth: "42ch",
                    marginBottom: 28,
                  }}
                >
                  Built on our sites, not in a focus group. Workwear, tools and
                  household kits that our own tradesmen reach for every day.
                </p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setSearch("")}
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
                  Shop the range →
                </button>
                <button
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
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Trade accounts
                </button>
              </div>
            </div>
            {/* Hero art */}
            <div
              style={{
                background: "linear-gradient(145deg,#1a4330,#0b2018)",
                overflow: "hidden",
              }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 600 460" style={{ width: "100%", height: "100%", display: "block" }}>
                <defs>
                  <pattern id="gr" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gr)" />
                <g transform="translate(120,120)">
                  <path d="M 60 20 L 120 20 L 140 45 L 115 60 L 115 200 L 25 200 L 25 60 L 0 45 Z" fill="#e8dcb6" stroke="#f7e574" strokeWidth="3" />
                  <rect x="30" y="110" width="80" height="10" fill="#c2783a" />
                  <rect x="30" y="155" width="80" height="10" fill="#c2783a" />
                  <text x="70" y="90" textAnchor="middle" fontFamily="Inter Tight, sans-serif" fontWeight="800" fontSize="13" fill="#113021" letterSpacing="2">PL</text>
                </g>
                <rect y="420" width="600" height="40" fill="#0a1f14" />
              </svg>
            </div>
          </div>
        </section>
      )}

      {/* ── SEARCH BAR ───────────────────────────────────────────────── */}
      <section style={{ ...wrap, marginTop: 28 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: `1px solid ${T.line}`,
              background: "#fff",
              padding: "10px 16px",
              borderRadius: 999,
              fontSize: 14,
              fontFamily: "inherit",
              color: T.ink,
              outline: "none",
            }}
          />
          {(search || activeCat) && (
            <button
              onClick={() => { setSearch(""); setActiveCat(undefined); }}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: `1px solid ${T.line}`,
                background: "#fff",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                color: T.moss,
              }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* ── CATEGORY GRID (home only) ─────────────────────────────────── */}
      {isHome && categories.length > 0 && (
        <section style={{ ...wrap, marginTop: 56 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 28,
            }}
          >
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.02em", margin: 0 }}>
              Shop by <span style={{ fontStyle: "italic", color: T.sage }}>category</span>
            </h2>
            <button
              onClick={() => setActiveCat(undefined)}
              style={{ fontSize: 13, color: T.sage, background: "none", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.12em" }}
            >
              All categories →
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
            }}
          >
            {categories.slice(0, 4).map((cat, i) => {
              const count = products.filter((p) => p.categoryId === cat.id && p.status === "live").length;
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCat(cat.slug)}
                  style={{
                    background: "#fff",
                    border: `1px solid ${T.line}`,
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "grid",
                    gridTemplateRows: "180px auto",
                    transition: "transform 0.2s, box-shadow 0.2s",
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
                    {cat.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      CAT_ARTWORKS[i % CAT_ARTWORKS.length]
                    )}
                  </div>
                  <div
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ margin: 0, fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 20, letterSpacing: "-0.01em" }}>
                      {cat.name}
                    </h3>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5d7363", letterSpacing: "0.1em" }}>
                      {count} items
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SHOP BY TRADE (home only) ─────────────────────────────────── */}
      {isHome && (
        <section style={{ ...wrap, marginTop: 80 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.02em", margin: 0 }}>
              Shop by <span style={{ fontStyle: "italic", color: T.sage }}>trade.</span>
            </h2>
            <p style={{ margin: "10px 0 0", fontSize: 15, color: T.moss }}>
              Curated sets for the role you work in — every day, every weather.
            </p>
          </div>
          <ShopByTrade onPick={(slug) => setActiveCat(slug)} />
        </section>
      )}

      {/* ── FEATURED STRIP (home only) ────────────────────────────────── */}
      {isHome && featured.length > 0 && (
        <section style={{ ...wrap, marginTop: 80, paddingBottom: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 28,
            }}
          >
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-0.02em", margin: 0 }}>
              New <span style={{ fontStyle: "italic", color: T.sage }}>this week</span>
            </h2>
            <span style={{ fontSize: 13, color: T.sage, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Shop all new →
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} category={catMap[p.categoryId!]} />
            ))}
          </div>
        </section>
      )}

      {/* ── TRUST BAND ───────────────────────────────────────────────── */}
      {isHome && (
        <div style={{ marginTop: 80 }}>
          <TrustBand />
        </div>
      )}

      {/* ── PLP: category / search results ───────────────────────────── */}
      {(!isHome || activeCat || search) && (
        <>
          <section style={{ ...wrap, marginTop: 28 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5d7363", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>
              <button onClick={() => { setActiveCat(undefined); setSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#5d7363", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}>Shop</button>
              {activeCat && <> · <b style={{ color: T.ink }}>{categories.find((c) => c.slug === activeCat)?.name}</b></>}
              {search && <> · <b style={{ color: T.ink }}>Search: {search}</b></>}
            </div>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: "clamp(40px,5vw,64px)", letterSpacing: "-0.025em", margin: "0 0 8px", lineHeight: 1 }}>
              {activeCat
                ? categories.find((c) => c.slug === activeCat)?.name
                : <><em style={{ fontStyle: "italic", color: T.sage }}>Results</em></>}
            </h1>
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5d7363", letterSpacing: "0.12em" }}>
                {filtered.length} items
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 13 }}>
                <span style={{ color: T.moss }}>Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  style={{ border: `1px solid ${T.line}`, background: "#fff", padding: "8px 12px", borderRadius: 6, fontFamily: "inherit", fontSize: 13 }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: low → high</option>
                  <option value="price-desc">Price: high → low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </section>

          <section
            style={{
              ...wrap,
              marginTop: 28,
              marginBottom: 80,
              display: "grid",
              gridTemplateColumns: "250px 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* Filters sidebar */}
            <aside style={{ position: "sticky", top: 80 }}>
              {/* Category filter */}
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: T.sage, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
                Category
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px" }}>
                <li
                  onClick={() => setActiveCat(undefined)}
                  style={{ padding: "5px 0", fontSize: 13.5, color: activeCat ? T.moss : T.ink, fontWeight: activeCat ? 400 : 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                >
                  All categories
                </li>
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => setActiveCat(cat.slug)}
                    style={{ padding: "5px 0", fontSize: 13.5, color: activeCat === cat.slug ? T.ink : T.moss, fontWeight: activeCat === cat.slug ? 600 : 400, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                  >
                    {cat.name}
                    <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#8a9489" }}>
                      {products.filter((p) => p.categoryId === cat.id && p.status === "live").length}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Price filter chips */}
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: T.sage, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12, paddingTop: 18, borderTop: `1px solid ${T.line}` }}>
                Sort
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 22 }}>
                {(["featured", "price-asc", "price-desc", "newest"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    style={{
                      padding: "5px 10px",
                      border: `1px solid ${s === sortBy ? T.ink : T.line}`,
                      borderRadius: 999,
                      fontSize: 12,
                      cursor: "pointer",
                      background: s === sortBy ? T.ink : "#fff",
                      color: s === sortBy ? "#fff" : T.ink,
                      fontFamily: "inherit",
                    }}
                  >
                    {{ featured: "Featured", "price-asc": "Price ↑", "price-desc": "Price ↓", newest: "Newest" }[s]}
                  </button>
                ))}
              </div>
            </aside>

            {/* Product grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {filtered.length === 0 ? (
                <div style={{ gridColumn: "1/-1", padding: "60px 0", textAlign: "center", color: T.moss }}>
                  No products found.
                </div>
              ) : (
                filtered.map((p) => (
                  <ProductCard key={p.id} product={p} category={catMap[p.categoryId!]} />
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
