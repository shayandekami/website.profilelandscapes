import type { encyclopediaEntries } from "@/lib/db/schema";

type Entry = typeof encyclopediaEntries.$inferSelect;

interface DefaultEncyclopediaPageProps {
  entries: Entry[];
  selectedTag?: string;
  searchQuery?: string;
}

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

export function DefaultEncyclopediaPage({ entries, selectedTag, searchQuery }: DefaultEncyclopediaPageProps) {
  // Collect tags present in this result set
  const activeTags = Array.from(new Set(entries.flatMap((e) => e.tags)));

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
          <div style={{ marginBottom: 12, fontSize: 13, color: "var(--text-muted, #6b7280)" }}>
            <a href="/">Home</a> &nbsp;&middot;&nbsp; Plant Encyclopedia
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700 }}>Plant Encyclopedia</h1>
          <p style={{ margin: "12px 0 0", color: "var(--text-muted, #6b7280)", fontSize: 15 }}>
            Comprehensive botanical reference for garden planning.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: "24px 0", borderBottom: "1px solid var(--line-2, #e5e7eb)" }}>
        <div className="wrap">
          <form method="GET" action="/encyclopedia" style={{ marginBottom: 16, display: "flex", gap: 8 }}>
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
                width: 280,
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

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href={searchQuery ? `/encyclopedia?q=${encodeURIComponent(searchQuery)}` : "/encyclopedia"}
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
              All
            </a>
            {activeTags.map((tag) => {
              const active = selectedTag === tag;
              const href = searchQuery
                ? `/encyclopedia?tag=${tag}&q=${encodeURIComponent(searchQuery)}`
                : `/encyclopedia?tag=${tag}`;
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

      {/* Entry grid */}
      <section style={{ padding: "40px 0 64px" }}>
        <div className="wrap">
          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted, #6b7280)" }}>
              <p style={{ fontSize: 18 }}>No entries found.</p>
              <a href="/encyclopedia" style={{ color: "var(--color-accent, #2563eb)", textDecoration: "none" }}>
                Clear filters
              </a>
            </div>
          ) : (
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
              className="encyclopedia-grid"
            >
              {entries.map((entry) => {
                const img = entry.images?.[0];
                const excerpt = entry.description
                  ? entry.description.slice(0, 160) + (entry.description.length > 160 ? "…" : "")
                  : null;

                return (
                  <div
                    key={entry.id}
                    style={{
                      border: "1px solid var(--line-2, #e5e7eb)",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#fff",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {img && (
                      <a href={`/encyclopedia/${entry.slug}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.alt || entry.latinName}
                          style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                        />
                      </a>
                    )}
                    <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      {/* Tags */}
                      {entry.tags.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {entry.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "2px 7px",
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

                      <div>
                        <a
                          href={`/encyclopedia/${entry.slug}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <em style={{ fontSize: 17, fontWeight: 700, display: "block", lineHeight: 1.3, color: "var(--text-base, #111827)", fontStyle: "italic" }}>
                            {entry.latinName}
                          </em>
                          {entry.commonName && (
                            <span style={{ fontSize: 14, color: "var(--text-muted, #6b7280)", display: "block", marginTop: 2 }}>
                              {entry.commonName}
                            </span>
                          )}
                        </a>
                      </div>

                      {excerpt && (
                        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-muted, #6b7280)", margin: 0, flex: 1 }}>
                          {excerpt}
                        </p>
                      )}

                      <a
                        href={`/encyclopedia/${entry.slug}`}
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--color-accent, #2563eb)",
                          textDecoration: "none",
                          marginTop: 4,
                        }}
                      >
                        Read more →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) { .encyclopedia-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .encyclopedia-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
