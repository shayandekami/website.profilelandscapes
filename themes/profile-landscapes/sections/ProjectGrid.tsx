import { db, projects } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

/**
 * Server component — pulls live projects from the DB.
 * Sections that need DB access just import db directly; nothing in the
 * theme contract requires sections to be pure.
 */
export async function ProjectGrid() {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "live"))
    .orderBy(desc(projects.featured), desc(projects.completedAt));

  return (
    <section className="proj-grid-section">
      <div className="wrap">
        <div className="proj-grid">
          {rows.map((p) => (
            <a key={p.id} href={`/projects/${p.slug}`} className="proj-card fade-target">
              <div className="proj-img">
                {p.heroImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.heroImage} alt={p.title} />
                )}
              </div>
              <div className="proj-meta">
                <div className="eyebrow">{p.suburb}</div>
                <h3>{p.title}</h3>
                {p.summary && <p>{p.summary}</p>}
                <div className="proj-footer">
                  <span className="chip">{p.sector}</span>
                  {p.packageValue && <span className="val">{p.packageValue}</span>}
                </div>
              </div>
            </a>
          ))}
          {rows.length === 0 && (
            <p style={{ color: "var(--ink-2)" }}>
              No projects published yet — add one from the admin portfolio editor.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
