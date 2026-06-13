import { db, projects } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function FeaturedProjects({ props }: { props: Record<string, unknown> }) {
  const p = props as {
    eyebrow?: string;
    title?: string;
    titleItalic?: string;
    cta?: { label: string; href: string };
    limit?: number;
  };

  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "live"))
    .orderBy(desc(projects.featured), desc(projects.completedAt))
    .limit(p.limit ?? 6);

  return (
    <section className="featured-work">
      <div className="wrap">
        <div className="sec-head-left">
          <div>
            {p.eyebrow && <span className="eyebrow">{p.eyebrow}</span>}
            <h2 className="display">
              {p.title ?? "Selected work"}
              {p.titleItalic && (
                <> <em style={{ fontStyle: "italic" }}>{p.titleItalic}</em></>
              )}
            </h2>
          </div>
          {p.cta && (
            <a href={p.cta.href} className="read-more">
              {p.cta.label} →
            </a>
          )}
        </div>

        <div className="proj-grid2">
          {rows.map((proj) => (
            <a key={proj.id} href={`/projects/${proj.slug}`} className="proj-card fade-target">
              <div className="ph">
                {proj.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={proj.heroImage} alt={proj.title} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "var(--bone)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="12" width="28" height="20" rx="2" stroke="var(--ink-2)" strokeWidth="1.5" fill="none"/>
                      <circle cx="14" cy="19" r="3" stroke="var(--ink-2)" strokeWidth="1.5" fill="none"/>
                      <path d="M6 28 L14 20 L20 26 L26 19 L34 28" stroke="var(--ink-2)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="meta">
                <div>
                  <div style={{ fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 4 }}>
                    {proj.suburb}
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 400, letterSpacing: "-0.01em", color: "var(--ink)" }}>
                    {proj.title}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  {proj.sector && (
                    <span className="chip" style={{ fontSize: 11, padding: "4px 10px" }}>{proj.sector}</span>
                  )}
                </div>
              </div>
            </a>
          ))}
          {rows.length === 0 && (
            <p style={{ color: "var(--ink-2)", gridColumn: "1/-1" }}>
              No projects published yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
