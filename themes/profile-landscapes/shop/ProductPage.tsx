"use client";

import { useState } from "react";
import { addToCart } from "@/lib/buyCart";

type Product = typeof import("@/lib/db/schema").products.$inferSelect;
type ProductCategory =
  typeof import("@/lib/db/schema").productCategories.$inferSelect;

const T = {
  ink: "#133024",
  sage: "#1f5a3d",
  moss: "#3c554a",
  ochre: "#c2783a",
  cream: "#f5efdc",
  paper: "#faf6eb",
  line: "rgba(19,48,36,0.12)",
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function RelatedCard({ product }: { product: Product }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
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
      <div style={{ height: 200, background: "#f3ecd9", position: "relative", overflow: "hidden" }}>
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <svg viewBox="0 0 320 200" style={{ width: "100%", height: "100%", display: "block" }}>
            <rect width="100%" height="100%" fill="#e8e0c9" />
          </svg>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <h4
          style={{
            margin: "0 0 6px",
            fontFamily: "Fraunces, serif",
            fontWeight: 400,
            fontSize: 17,
            letterSpacing: "-0.005em",
            lineHeight: 1.2,
            color: T.ink,
          }}
        >
          {product.name}
        </h4>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            fontSize: 15,
            color: T.ink,
          }}
        >
          {fmt(product.priceCents)}
        </div>
      </div>
    </div>
  );
}

interface ProductPageProps {
  product: Product & { category?: ProductCategory | null };
  related: Product[];
  category?: ProductCategory;
}

export function ProductPage({ product, related, category: categoryProp }: ProductPageProps) {
  // The shop route passes a product with its category relation nested; fall
  // back to that when an explicit category prop isn't provided.
  const category = categoryProp ?? product.category ?? undefined;
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const sizes = product.sizes ?? [];
  const colours = product.colours ?? [];
  const fits = product.fits ?? [];
  const specs = product.specs ?? [];

  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [colour, setColour] = useState<string | undefined>(colours[0]?.name);
  const [fit, setFit] = useState<string | undefined>(fits[0]);

  const inStock = product.stockQty > 0;
  const hasCompare = product.compareAtCents && product.compareAtCents > product.priceCents;
  const images = product.images?.length ? product.images : [];

  function handleAdd() {
    if (!inStock) return;
    addToCart({
      type: "product",
      id: product.id,
      name: product.name,
      image: images[0]?.url,
      priceCents: product.priceCents,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const wrap: React.CSSProperties = { maxWidth: 1400, margin: "0 auto", padding: "0 56px" };

  return (
    <div style={{ background: "#faf6eb", color: T.ink, fontFamily: "'Inter Tight', sans-serif" }}>

      {/* Breadcrumb */}
      <section style={{ ...wrap, paddingTop: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5d7363", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>
          <a href="/shop" style={{ color: "#5d7363", textDecoration: "none" }}>Shop</a>
          {category && <> · <a href={`/shop/${category.slug}`} style={{ color: "#5d7363", textDecoration: "none" }}>{category.name}</a></>}
          {" · "}
          <b style={{ color: T.ink }}>{product.name}</b>
        </div>

        {/* Two-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "start" }}>

          {/* Gallery */}
          <div style={{ position: "sticky", top: 80, display: "grid", gridTemplateColumns: "80px 1fr", gap: 14 }}>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: "grid", gap: 10 }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      background: "#fff",
                      border: `${i === activeImg ? "2px" : "1px"} solid ${i === activeImg ? T.ink : T.line}`,
                      borderRadius: 6,
                      aspectRatio: "1",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Main image */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                aspectRatio: "1",
                overflow: "hidden",
                position: "relative",
                gridColumn: images.length > 1 ? "auto" : "1/-1",
              }}
            >
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImg]?.url || images[0].url}
                  alt={images[activeImg]?.alt || product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <svg viewBox="0 0 500 500" style={{ width: "100%", height: "100%", display: "block" }}>
                  <rect width="100%" height="100%" fill="#f5efdc" />
                  <text x="250" y="260" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="18" fill="#8a9489">
                    {product.name}
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
                Click to zoom
              </div>
            </div>
          </div>

          {/* Product info */}
          <div>
            {category && (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.sage, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {category.name}
              </div>
            )}
            <h1
              style={{
                fontFamily: "Fraunces, serif",
                fontWeight: 400,
                fontSize: "clamp(32px,3.6vw,46px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                margin: "10px 0 14px",
                color: T.ink,
              }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: T.moss, marginBottom: 20 }}>
              <span style={{ color: T.ochre, fontSize: 15, letterSpacing: 2 }}>★★★★★</span>
              <span>Site-tested quality</span>
            </div>

            {/* Price block */}
            <div
              style={{
                padding: "22px 0",
                borderTop: `1px solid ${T.line}`,
                borderBottom: `1px solid ${T.line}`,
                marginBottom: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "Fraunces, serif",
                  fontWeight: 400,
                  fontSize: 42,
                  letterSpacing: "-0.02em",
                  color: T.ink,
                }}
              >
                {hasCompare && (
                  <s style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, color: "#8a9489", marginRight: 10, fontWeight: 400 }}>
                    {fmt(product.compareAtCents!)}
                  </s>
                )}
                {fmt(product.priceCents)}
              </div>
              <div
                style={{
                  color: inStock ? T.sage : "#c2783a",
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
                    background: inStock ? T.sage : "#c2783a",
                    display: "inline-block",
                  }}
                />
                {inStock ? `In stock · ships tomorrow` : "Out of stock"}
              </div>
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p style={{ fontSize: 15, lineHeight: 1.6, color: T.moss, marginBottom: 24 }}>
                {product.shortDescription}
              </p>
            )}

            {/* Colour swatches */}
            {colours.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#5d7363", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                  Colour: <span style={{ color: T.ink }}>{colour}</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {colours.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColour(c.name)}
                      aria-label={c.name}
                      title={c.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        background: c.hex,
                        border: `2px solid ${colour === c.name ? T.ink : "rgba(19,48,36,0.18)"}`,
                        outline: colour === c.name ? `2px solid #fff` : "none",
                        outlineOffset: -4,
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#5d7363", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                  <span>Size: <span style={{ color: T.ink }}>{size}</span></span>
                  <a href="#" style={{ color: T.sage, textDecoration: "none" }}>Size guide</a>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        minWidth: 48,
                        padding: "10px 12px",
                        border: `1px solid ${size === s ? T.ink : T.line}`,
                        background: size === s ? T.ink : "#fff",
                        color: size === s ? "#fff" : T.ink,
                        borderRadius: 6,
                        fontSize: 13.5,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fit selector */}
            {fits.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#5d7363", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                  Fit: <span style={{ color: T.ink }}>{fit}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {fits.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFit(f)}
                      style={{
                        padding: "9px 18px",
                        border: `1px solid ${fit === f ? T.ink : T.line}`,
                        background: fit === f ? T.ink : "#fff",
                        color: fit === f ? "#fff" : T.ink,
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add to cart */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, marginBottom: 14, alignItems: "center" }}>
              {/* Qty selector */}
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
                  style={{ width: 38, height: 48, background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: T.ink }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: 40, height: 48, textAlign: "center", border: "none", background: "transparent", fontSize: 15, fontWeight: 500, fontFamily: "inherit", color: T.ink }}
                />
                <button
                  onClick={() => setQty(qty + 1)}
                  style={{ width: 38, height: 48, background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: T.ink }}
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAdd}
                disabled={!inStock}
                style={{
                  flex: 1,
                  background: added ? T.sage : inStock ? T.ink : "#a0a8a0",
                  color: "#fff",
                  border: "none",
                  padding: 16,
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: inStock ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  transition: "background 0.18s",
                }}
              >
                {added ? "Added to cart ✓" : inStock ? `Add to cart · ${fmt(product.priceCents * qty)}` : "Out of stock"}
              </button>

              {/* Fav */}
              <button
                aria-label="Save"
                style={{
                  width: 48,
                  height: 48,
                  border: `1px solid ${T.line}`,
                  borderRadius: 999,
                  background: "#fff",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M 12 20 L 4 12 Q 0 6 6 4 Q 10 4 12 8 Q 14 4 18 4 Q 24 6 20 12 Z" stroke={T.ink} strokeWidth="1.5" />
                </svg>
              </button>
            </div>

            {/* Trust badges */}
            <div
              style={{
                marginTop: 20,
                padding: 18,
                background: "#fbf7ea",
                border: `1px solid ${T.line}`,
                borderRadius: 8,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                fontSize: 13,
              }}
            >
              {[
                { title: "Site-tested quality", body: "Used on our own projects before we stock it." },
                { title: "Free delivery over $200", body: "Or pickup from Petersham — same day ready." },
                { title: "30-day returns", body: "Hassle-free if unused in original packaging." },
                { title: "Trade accounts", body: "Nett 30, bulk pricing, named rep." },
              ].map((b, i) => (
                <div key={i}>
                  <h5 style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: T.ink }}>{b.title}</h5>
                  <p style={{ margin: 0, color: "#5d7363", fontSize: 12.5, lineHeight: 1.4 }}>{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {product.description && (
        <section style={{ ...wrap, marginTop: 60, marginBottom: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", color: T.sage, textTransform: "uppercase", marginBottom: 12 }}>
                About this product
              </div>
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 32, letterSpacing: "-0.02em", margin: "0 0 18px", color: T.ink }}>
                Why we stock it
              </h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: T.moss }}>{product.description}</p>
            </div>
            <div>
              {/* Specs grid */}
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", color: T.sage, textTransform: "uppercase", marginBottom: 12 }}>
                Specifications
              </div>
              <div style={{ borderTop: `1px solid ${T.ink}` }}>
                {(specs.length > 0
                  ? specs.map((s) => ({ k: s.key, v: s.value }))
                  : [
                      { k: "SKU", v: product.sku || "—" },
                      { k: "Stock", v: `${product.stockQty} units` },
                      { k: "Status", v: product.badge || "In stock" },
                    ]
                ).map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "140px 1fr",
                      borderBottom: `1px solid ${T.line}`,
                    }}
                  >
                    <div
                      style={{
                        padding: "14px 16px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10.5,
                        color: "#5d7363",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        background: "#fbf7ea",
                      }}
                    >
                      {row.k}
                    </div>
                    <div style={{ padding: "14px 16px", fontWeight: 500, fontSize: 13.5, color: T.ink }}>
                      {row.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section style={{ ...wrap, paddingTop: 60, paddingBottom: 80 }}>
          <h3
            style={{
              fontFamily: "Fraunces, serif",
              fontWeight: 300,
              fontSize: 32,
              letterSpacing: "-0.02em",
              margin: "0 0 24px",
              color: T.ink,
            }}
          >
            You might also <span style={{ fontStyle: "italic", color: T.sage }}>like.</span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {related.slice(0, 4).map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
