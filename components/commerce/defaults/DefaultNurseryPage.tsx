import type { plants } from "@/lib/db/schema";
import { AddToCartButton } from "./AddToCartButton";

type Plant = typeof plants.$inferSelect;

interface DefaultNurseryPageProps {
  plants: Plant[];
  selectedTag?: string;
  searchQuery?: string;
}

const ALL_TAGS = ["NATIVE", "DROUGHT", "FRAGRANT", "EDIBLE", "FAST_GROWING", "LOW_MAINTENANCE"];

const TAG_LABELS: Record<string, string> = {
  NATIVE: "Native",
  DROUGHT: "Drought Tolerant",
  FRAGRANT: "Fragrant",
  EDIBLE: "Edible",
  FAST_GROWING: "Fast Growing",
  LOW_MAINTENANCE: "Low Maintenance",
};

function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function DefaultNurseryPage({ plants, selectedTag, searchQuery }: DefaultNurseryPageProps) {
  // Collect tags that actually appear in results
  const activeTags = Array.from(new Set(plants.flatMap((p) => p.tags)));
  const displayTags = ALL_TAGS.filter((t) => activeTags.includes(t));

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: "var(--color-surface, #f8f8f6)",
          padding: "48px 0 32px",
          borderBottom: "1px solid var(--line-2, #e5e7eb)",
        }}
      >
        <div className="wrap">
          <div className="crumbs" style={{ marginBottom: 12, fontSize: 13, color: "var(--text-muted, #6b7280)" }}>
            <a href="/">Home</a> &nbsp;&middot;&nbsp; Nursery
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700 }}>Nursery</h1>
          <p style={{ margin: "12px 0 0", color: "var(--text-muted, #6b7280)", fontSize: 15 }}>
            Hand-picked plants ready for your garden.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: "24px 0", borderBottom: "1px solid var(--line-2, #e5e7eb)" }}>
        <div className="wrap">
          {/* Search */}
          <form method="GET" action="/plants" style={{ marginBottom: 16, display: "flex", gap: 8 }}>
            {selectedTag && <input type="hidden" name="tag" value={selectedTag} />}
            <input
              type="search"
              name="q"
              defaultValue={searchQuery || ""}
              placeholder="Search by name…"
              style={{
                padding: "8px 14px",
                border: "1px solid var(--line-2, #d1d5db)",
                borderRadius: 8,
                fontSize: 14,
                width: 260,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                background: "var(--color-accent, #2563eb)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Search
            </button>
          </form>

          {/* Tag pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href={searchQuery ? `/plants?q=${encodeURIComponent(searchQuery)}` : "/plants"}
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                background: !selectedTag ? "var(--color-accent, #2563eb)" : "var(--color-surface, #f3f4f6)",
                color: !selectedTag ? "#fff" : "var(--text-base, #374151)",
                border: "1px solid var(--line-2, #e5e7eb)",
              }}
            >
              All Plants
            </a>
            {displayTags.map((tag) => {
              const active = selectedTag === tag;
              const href = searchQuery
                ? `/plants?tag=${tag}&q=${encodeURIComponent(searchQuery)}`
                : `/plants?tag=${tag}`;
              return (
                <a
                  key={tag}
                  href={href}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    background: active ? "var(--color-accent, #2563eb)" : "var(--color-surface, #f3f4f6)",
                    color: active ? "#fff" : "var(--text-base, #374151)",
                    border: "1px solid var(--line-2, #e5e7eb)",
                  }}
                >
                  {TAG_LABELS[tag] || tag}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plant grid */}
      <section style={{ padding: "40px 0 64px" }}>
        <div className="wrap">
          {plants.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted, #6b7280)" }}>
              <p style={{ fontSize: 18 }}>No plants found.</p>
              <a href="/plants" style={{ color: "var(--color-accent, #2563eb)", textDecoration: "none" }}>
                Clear filters
              </a>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 24,
              }}
              className="nursery-grid"
            >
              {plants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) { .nursery-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px)  { .nursery-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px)  { .nursery-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

function PlantCard({ plant }: { plant: Plant }) {
  const img = plant.images?.[0];
  const isOutOfStock = plant.stockQty === 0;
  const isLowStock = plant.stockQty > 0 && plant.stockQty < 5;

  return (
    <div
      style={{
        border: "1px solid var(--line-2, #e5e7eb)",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <a href={`/plants/${plant.slug}`} style={{ display: "block" }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.alt || plant.latinName}
            style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              background: "var(--color-surface, #f0fdf4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted, #9ca3af)",
              fontSize: 24,
            }}
          >
            🌿
          </div>
        )}
      </a>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Tags */}
        {plant.tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {plant.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 7px",
                  borderRadius: 4,
                  background: "var(--color-surface, #f0fdf4)",
                  color: "#16a34a",
                  border: "1px solid #bbf7d0",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {TAG_LABELS[tag] || tag}
              </span>
            ))}
          </div>
        )}

        <a href={`/plants/${plant.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
          <em style={{ fontSize: 14, fontWeight: 600, fontStyle: "italic", display: "block", lineHeight: 1.3, color: "var(--text-base, #111827)" }}>
            {plant.latinName}
          </em>
          {plant.commonName && (
            <span style={{ fontSize: 13, color: "var(--text-muted, #6b7280)", display: "block" }}>
              {plant.commonName}
            </span>
          )}
        </a>

        {plant.size && (
          <div style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)" }}>{plant.size}</div>
        )}

        {/* Price */}
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-accent, #2563eb)", marginTop: 4 }}>
          {centsToDisplay(plant.priceCents)}
        </div>

        {/* Stock */}
        {isOutOfStock && (
          <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 500 }}>Out of stock</div>
        )}
        {isLowStock && (
          <div style={{ fontSize: 12, color: "#d97706", fontWeight: 500 }}>Only {plant.stockQty} left</div>
        )}

        {/* Add to cart */}
        <div style={{ marginTop: "auto", paddingTop: 12 }}>
          {isOutOfStock ? (
            <button
              disabled
              style={{
                width: "100%",
                padding: "9px",
                background: "var(--color-surface, #f3f4f6)",
                color: "var(--text-muted, #9ca3af)",
                border: "1px solid var(--line-2, #e5e7eb)",
                borderRadius: 8,
                fontSize: 14,
                cursor: "not-allowed",
              }}
            >
              Out of stock
            </button>
          ) : (
            <AddToCartButton
              item={{
                type: "plant",
                id: plant.id,
                name: `${plant.latinName}${plant.commonName ? ` (${plant.commonName})` : ""}`,
                image: img?.url,
                priceCents: plant.priceCents,
              }}
              className="atc-btn-full"
            />
          )}
        </div>
      </div>
      <style>{`.atc-btn-full { width: 100%; text-align: center; }`}</style>
    </div>
  );
}
