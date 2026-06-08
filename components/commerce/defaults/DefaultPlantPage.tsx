import type { plants } from "@/lib/db/schema";
import type { PlantCare, PlantSeasons } from "@/lib/db/schema";
import { AddToCartButton } from "./AddToCartButton";

type Plant = typeof plants.$inferSelect;

interface DefaultPlantPageProps {
  plant: Plant;
  companions: Plant[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

function CareTable({ care }: { care: PlantCare }) {
  const rows: [string, string][] = [
    ["Water", care.water],
    ["Light", care.light],
    ["Soil", care.soil],
    ["Growth Rate", care.growthRate],
    ["Mature Size", care.matureSize],
  ];

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} style={{ borderBottom: "1px solid var(--line-2, #e5e7eb)" }}>
            <th
              style={{
                textAlign: "left",
                padding: "10px 16px 10px 0",
                fontWeight: 600,
                color: "var(--text-muted, #6b7280)",
                width: 140,
                verticalAlign: "top",
              }}
            >
              {label}
            </th>
            <td style={{ padding: "10px 0", color: "var(--text-base, #374151)" }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SeasonChart({ seasons }: { seasons: PlantSeasons }) {
  const flowering = new Set(seasons.flowering || []);
  const fruiting = new Set(seasons.fruiting || []);
  const hasData = flowering.size > 0 || fruiting.size > 0;

  if (!hasData) return null;

  return (
    <div style={{ marginTop: 0 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Seasonal Calendar</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: "6px 8px 6px 0", textAlign: "left", fontWeight: 500, color: "var(--text-muted, #9ca3af)", width: 80 }}>
                &nbsp;
              </th>
              {MONTHS.map((m) => (
                <th key={m} style={{ padding: "6px 6px", textAlign: "center", fontWeight: 500, color: "var(--text-muted, #9ca3af)", minWidth: 36 }}>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flowering.size > 0 && (
              <tr>
                <td style={{ padding: "6px 8px 6px 0", fontWeight: 500, color: "#ec4899", whiteSpace: "nowrap" }}>🌸 Flowering</td>
                {MONTHS.map((_, i) => (
                  <td key={i} style={{ padding: "4px 6px", textAlign: "center" }}>
                    {flowering.has(i + 1) ? (
                      <span style={{ display: "inline-block", width: 20, height: 20, background: "#fce7f3", borderRadius: 4 }} />
                    ) : (
                      <span style={{ display: "inline-block", width: 20, height: 20, background: "#f9fafb", borderRadius: 4 }} />
                    )}
                  </td>
                ))}
              </tr>
            )}
            {fruiting.size > 0 && (
              <tr>
                <td style={{ padding: "6px 8px 6px 0", fontWeight: 500, color: "#d97706", whiteSpace: "nowrap" }}>🍊 Fruiting</td>
                {MONTHS.map((_, i) => (
                  <td key={i} style={{ padding: "4px 6px", textAlign: "center" }}>
                    {fruiting.has(i + 1) ? (
                      <span style={{ display: "inline-block", width: 20, height: 20, background: "#fef3c7", borderRadius: 4 }} />
                    ) : (
                      <span style={{ display: "inline-block", width: 20, height: 20, background: "#f9fafb", borderRadius: 4 }} />
                    )}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DefaultPlantPage({ plant, companions }: DefaultPlantPageProps) {
  const mainImg = plant.images?.[0];
  const isOutOfStock = plant.stockQty === 0;
  const isLowStock = plant.stockQty > 0 && plant.stockQty < 5;

  return (
    <>
      {/* Breadcrumbs */}
      <section style={{ padding: "16px 0", borderBottom: "1px solid var(--line-2, #e5e7eb)" }}>
        <div className="wrap">
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b7280)" }}>
            <a href="/" style={{ color: "inherit" }}>Home</a>
            &nbsp;&middot;&nbsp;
            <a href="/plants" style={{ color: "inherit" }}>Nursery</a>
            &nbsp;&middot;&nbsp;
            <em>{plant.latinName}</em>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: "48px 0" }}>
        <div className="wrap">
          <div
            className="plant-detail-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}
          >
            {/* Images */}
            <div>
              {mainImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImg.url}
                  alt={mainImg.alt || plant.latinName}
                  style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "4/3" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4/3",
                    background: "#f0fdf4",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                  }}
                >
                  🌿
                </div>
              )}
              {plant.images.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {plant.images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img.url}
                      alt={img.alt || ""}
                      style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line-2, #e5e7eb)" }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {/* Tags */}
              {plant.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {plant.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 4,
                        background: "#f0fdf4",
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

              <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 4px", lineHeight: 1.2, fontStyle: "italic" }}>
                {plant.latinName}
              </h1>
              {plant.commonName && (
                <p style={{ fontSize: 18, color: "var(--text-muted, #6b7280)", margin: "0 0 16px" }}>
                  {plant.commonName}
                </p>
              )}
              {plant.family && (
                <p style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Family: {plant.family}
                </p>
              )}

              {plant.size && (
                <div style={{ fontSize: 14, marginBottom: 12, color: "var(--text-base, #374151)" }}>
                  <strong>Size:</strong> {plant.size}
                </div>
              )}

              {/* Price */}
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-accent, #2563eb)", marginBottom: 16 }}>
                {centsToDisplay(plant.priceCents)}
              </div>

              {plant.shortDescription && (
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-base, #374151)", margin: "0 0 20px" }}>
                  {plant.shortDescription}
                </p>
              )}

              {/* Stock */}
              {isOutOfStock && (
                <div style={{ color: "#dc2626", fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Out of stock</div>
              )}
              {isLowStock && (
                <div style={{ color: "#d97706", fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
                  Only {plant.stockQty} left
                </div>
              )}

              {/* Add to cart */}
              {!isOutOfStock ? (
                <AddToCartButton
                  item={{
                    type: "plant",
                    id: plant.id,
                    name: `${plant.latinName}${plant.commonName ? ` (${plant.commonName})` : ""}`,
                    image: mainImg?.url,
                    priceCents: plant.priceCents,
                  }}
                  label="Add to Cart"
                />
              ) : (
                <button
                  disabled
                  style={{
                    padding: "12px 28px",
                    background: "#f3f4f6",
                    color: "#9ca3af",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 15,
                    cursor: "not-allowed",
                  }}
                >
                  Out of Stock
                </button>
              )}
            </div>
          </div>

          {/* Care table + description + season chart */}
          <div style={{ marginTop: 56, borderTop: "1px solid var(--line-2, #e5e7eb)", paddingTop: 40 }}>
            <div
              className="plant-lower-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}
            >
              <div>
                {plant.description && (
                  <>
                    <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>About this plant</h2>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-base, #374151)", margin: "0 0 32px" }}>
                      {plant.description}
                    </p>
                  </>
                )}
                {plant.seasons && <SeasonChart seasons={plant.seasons} />}
              </div>

              {plant.care && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Care guide</h2>
                  <CareTable care={plant.care} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Companion plants */}
      {companions.length > 0 && (
        <section style={{ padding: "48px 0 64px", background: "var(--color-surface, #f0fdf4)", borderTop: "1px solid var(--line-2, #e5e7eb)" }}>
          <div className="wrap">
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Companion Plants</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted, #6b7280)", marginBottom: 24 }}>
              These plants grow well alongside <em>{plant.latinName}</em>.
            </p>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}
              className="companions-grid"
            >
              {companions.map((comp) => {
                const img = comp.images?.[0];
                return (
                  <a key={comp.id} href={`/plants/${comp.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ border: "1px solid var(--line-2, #e5e7eb)", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img.url} alt={img.alt || comp.latinName} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", aspectRatio: "4/3", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🌿</div>
                      )}
                      <div style={{ padding: "12px 14px" }}>
                        <em style={{ fontWeight: 600, fontSize: 13, display: "block" }}>{comp.latinName}</em>
                        {comp.commonName && <span style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>{comp.commonName}</span>}
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-accent, #2563eb)", marginTop: 6 }}>
                          {centsToDisplay(comp.priceCents)}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          .plant-detail-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .plant-lower-grid { grid-template-columns: 1fr !important; }
          .companions-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
