import type { encyclopediaEntries } from "@/lib/db/schema";
import type { PlantCare, PlantSeasons } from "@/lib/db/schema";

type Entry = typeof encyclopediaEntries.$inferSelect;

interface DefaultEncyclopediaEntryPageProps {
  entry: Entry;
  companions: Entry[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TAG_LABELS: Record<string, string> = {
  NATIVE: "Native",
  DROUGHT: "Drought Tolerant",
  FRAGRANT: "Fragrant",
  EDIBLE: "Edible",
  FAST_GROWING: "Fast Growing",
  LOW_MAINTENANCE: "Low Maintenance",
  COASTAL: "Coastal",
  SHADE: "Shade Tolerant",
  GROUNDCOVER: "Groundcover",
  ORNAMENTAL: "Ornamental",
};

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
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Seasonal Calendar</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: "6px 8px 6px 0", textAlign: "left", fontWeight: 500, color: "var(--text-muted, #9ca3af)", width: 80 }} />
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
                    <span
                      style={{
                        display: "inline-block",
                        width: 20,
                        height: 20,
                        background: flowering.has(i + 1) ? "#fce7f3" : "#f9fafb",
                        borderRadius: 4,
                        border: flowering.has(i + 1) ? "1px solid #fbcfe8" : "1px solid #f3f4f6",
                      }}
                    />
                  </td>
                ))}
              </tr>
            )}
            {fruiting.size > 0 && (
              <tr>
                <td style={{ padding: "6px 8px 6px 0", fontWeight: 500, color: "#d97706", whiteSpace: "nowrap" }}>🍊 Fruiting</td>
                {MONTHS.map((_, i) => (
                  <td key={i} style={{ padding: "4px 6px", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 20,
                        height: 20,
                        background: fruiting.has(i + 1) ? "#fef3c7" : "#f9fafb",
                        borderRadius: 4,
                        border: fruiting.has(i + 1) ? "1px solid #fde68a" : "1px solid #f3f4f6",
                      }}
                    />
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

export function DefaultEncyclopediaEntryPage({ entry, companions }: DefaultEncyclopediaEntryPageProps) {
  const mainImg = entry.images?.[0];

  return (
    <>
      {/* Breadcrumbs */}
      <section style={{ padding: "16px 0", borderBottom: "1px solid var(--line-2, #e5e7eb)" }}>
        <div className="wrap">
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b7280)" }}>
            <a href="/" style={{ color: "inherit" }}>Home</a>
            &nbsp;&middot;&nbsp;
            <a href="/encyclopedia" style={{ color: "inherit" }}>Plant Encyclopedia</a>
            &nbsp;&middot;&nbsp;
            <em>{entry.latinName}</em>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section
        style={{
          background: "var(--color-surface, #f0fdf4)",
          padding: "48px 0",
          borderBottom: "1px solid var(--line-2, #e5e7eb)",
        }}
      >
        <div className="wrap">
          <div
            className="enc-hero-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}
          >
            <div>
              {/* Tags */}
              {entry.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 4,
                        background: "#fff",
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

              <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 8px", fontStyle: "italic", lineHeight: 1.2 }}>
                {entry.latinName}
              </h1>
              {entry.commonName && (
                <p style={{ fontSize: 20, color: "var(--text-muted, #6b7280)", margin: "0 0 8px" }}>
                  {entry.commonName}
                </p>
              )}
              {(entry.family || entry.genus) && (
                <p style={{ fontSize: 13, color: "var(--text-muted, #9ca3af)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {[entry.family && `Family: ${entry.family}`, entry.genus && `Genus: ${entry.genus}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              {/* Climate zones */}
              {entry.climateZones.length > 0 && (
                <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {entry.climateZones.map((zone) => (
                    <span
                      key={zone}
                      style={{
                        fontSize: 11,
                        padding: "3px 10px",
                        borderRadius: 4,
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        textTransform: "capitalize",
                      }}
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {mainImg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImg.url}
                alt={mainImg.alt || entry.latinName}
                style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "4/3" }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Body content */}
      <section style={{ padding: "56px 0" }}>
        <div className="wrap">
          <div
            className="enc-body-grid"
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 56, alignItems: "start" }}
          >
            {/* Left: description + seasonal + extras */}
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {entry.description && (
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Overview</h2>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-base, #374151)", margin: 0 }}>
                    {entry.description}
                  </p>
                </div>
              )}

              {entry.seasons && <SeasonChart seasons={entry.seasons} />}

              {entry.landscapeUse && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Landscape Use</h2>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-base, #374151)", margin: 0 }}>
                    {entry.landscapeUse}
                  </p>
                </div>
              )}

              {entry.propagation && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Propagation</h2>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-base, #374151)", margin: 0 }}>
                    {entry.propagation}
                  </p>
                </div>
              )}

              {entry.pestNotes && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Pests &amp; Diseases</h2>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-base, #374151)", margin: 0 }}>
                    {entry.pestNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Right: care table */}
            {entry.care && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Care Guide</h2>
                <CareTable care={entry.care} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Companion entries */}
      {companions.length > 0 && (
        <section style={{ padding: "48px 0 64px", background: "var(--color-surface, #f0fdf4)", borderTop: "1px solid var(--line-2, #e5e7eb)" }}>
          <div className="wrap">
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Companion Plants</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted, #6b7280)", marginBottom: 24 }}>
              Plants that thrive alongside <em>{entry.latinName}</em>.
            </p>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}
              className="enc-companions-grid"
            >
              {companions.map((comp) => {
                const img = comp.images?.[0];
                const excerpt = comp.description
                  ? comp.description.slice(0, 100) + (comp.description.length > 100 ? "…" : "")
                  : null;

                return (
                  <a key={comp.id} href={`/encyclopedia/${comp.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ border: "1px solid var(--line-2, #e5e7eb)", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img.url} alt={img.alt || comp.latinName} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                      )}
                      <div style={{ padding: "12px 14px" }}>
                        <em style={{ fontWeight: 600, fontSize: 14, display: "block" }}>{comp.latinName}</em>
                        {comp.commonName && <span style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>{comp.commonName}</span>}
                        {excerpt && <p style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", margin: "8px 0 0", lineHeight: 1.5 }}>{excerpt}</p>}
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
          .enc-hero-grid { grid-template-columns: 1fr !important; }
          .enc-body-grid { grid-template-columns: 1fr !important; }
          .enc-companions-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) { .enc-companions-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
