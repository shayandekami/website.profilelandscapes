import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, projects } from "@/lib/db";
import { eq, ne, and, desc } from "drizzle-orm";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const row = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
  });
  if (!row) return {};
  return {
    title: `${row.title} — Profile Landscapes`,
    description: row.summary || undefined,
    openGraph: row.heroImage ? { images: [row.heroImage] } : undefined,
  };
}

export default async function ProjectDetail({ params }: Params) {
  const { slug } = await params;
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
    with: { images: true },
  });

  if (!project || project.status !== "live") notFound();

  const related = await db
    .select()
    .from(projects)
    .where(and(eq(projects.status, "live"), ne(projects.id, project.id)))
    .orderBy(desc(projects.featured), desc(projects.completedAt))
    .limit(2);

  const completedYear = project.completedAt
    ? new Date(project.completedAt).getFullYear()
    : null;

  const sectorLabel: Record<string, string> = {
    residential: "Residential",
    commercial: "Commercial",
    civic: "Civic & Public",
    healthcare: "Healthcare & Education",
    mixed: "Mixed-Use",
  };

  return (
    <>
      {/* Full-bleed hero */}
      <section style={{ position: "relative", height: "min(80vh, 680px)", overflow: "hidden", background: "var(--ink)" }}>
        {project.heroImage && (
          <img src={project.heroImage} alt={project.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19,48,36,0.85) 0%, rgba(19,48,36,0.1) 60%)" }} />
        <div className="wrap" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 52 }}>
          <nav style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</a>
            <span>·</span>
            <a href="/projects" style={{ color: "inherit", textDecoration: "none" }}>Projects</a>
            <span>·</span>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>{project.suburb || project.title}</span>
          </nav>
          <h1 style={{ margin: 0, fontFamily: "var(--display)", fontSize: "clamp(36px,5.5vw,72px)", fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1, color: "#fff" }}>
            {project.title.includes("—") ? (
              <>
                {project.title.split("—")[0].trim()}
                <br />
                <em style={{ fontStyle: "italic", color: "#e8dcb6" }}>{project.title.split("—").slice(1).join("—").trim()}</em>
              </>
            ) : project.title}
          </h1>
        </div>
      </section>

      {/* 5-cell meta strip */}
      <section style={{ borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", borderLeft: "1px solid var(--line-2)" }}>
            {[
              { label: "Location", value: project.suburb || "—" },
              { label: "Principal", value: project.principal || "—" },
              { label: "Sector", value: sectorLabel[project.sector] || project.sector },
              { label: "Package", value: project.packageValue || "—" },
              { label: "Completed", value: completedYear ? String(completedYear) : "Ongoing" },
            ].map((cell) => (
              <div key={cell.label} style={{ padding: "24px 20px", borderRight: "1px solid var(--line-2)" }}>
                <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>{cell.label}</div>
                <div style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500 }}>{cell.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative */}
      {project.body && (
        <section style={{ padding: "72px 0" }}>
          <div className="wrap">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 80, alignItems: "start" }}>
              <div style={{ fontSize: 18, lineHeight: 1.7, color: "var(--ink)", fontFamily: "var(--display)", fontWeight: 400, letterSpacing: "-0.005em" }}>
                {project.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ margin: "0 0 24px" }}>{para}</p>
                ))}
              </div>
              <aside style={{ position: "sticky", top: 88, background: "var(--bone)", borderRadius: 4, padding: "28px 24px" }}>
                <div style={{ fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 20 }}>Project details</div>
                {[
                  { k: "Suburb", v: project.suburb },
                  { k: "Sector", v: sectorLabel[project.sector] || project.sector },
                  { k: "Principal", v: project.principal },
                  { k: "Package value", v: project.packageValue },
                  { k: "Year", v: completedYear ? String(completedYear) : null },
                ].filter((r) => r.v).map((row) => (
                  <div key={row.k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line-2)", fontSize: 14, gap: 16 }}>
                    <span style={{ color: "var(--ink-2)" }}>{row.k}</span>
                    <span style={{ color: "var(--ink)", textAlign: "right" }}>{row.v}</span>
                  </div>
                ))}
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {project.images && project.images.length > 0 && (
        <section style={{ padding: "0 0 80px" }}>
          <div className="wrap">
            <div style={{ columns: 2, columnGap: 16 }}>
              {project.images.map((img) => (
                <figure key={img.id} style={{ margin: "0 0 16px", breakInside: "avoid", borderRadius: 3, overflow: "hidden" }}>
                  <img src={img.url} alt={img.alt || ""} style={{ width: "100%", display: "block" }} />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related projects */}
      {related.length > 0 && (
        <section style={{ padding: "72px 0", borderTop: "1px solid var(--line-2)" }}>
          <div className="wrap">
            <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="eyebrow">More projects</span>
              <a href="/projects" style={{ fontSize: 13.5, color: "var(--ink)", borderBottom: "1px solid var(--line)", paddingBottom: 2, textDecoration: "none" }}>View all →</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {related.map((proj) => (
                <a key={proj.id} href={`/projects/${proj.slug}`} className="proj-card fade-target">
                  <div className="ph">
                    {proj.heroImage ? (
                      <img src={proj.heroImage} alt={proj.title} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "var(--bone)" }} />
                    )}
                  </div>
                  <div className="meta">
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 4 }}>{proj.suburb}</div>
                      <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 400, color: "var(--ink)" }}>{proj.title}</div>
                    </div>
                    {proj.sector && (
                      <span className="chip" style={{ fontSize: 11, padding: "4px 10px", flexShrink: 0 }}>{sectorLabel[proj.sector] || proj.sector}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
