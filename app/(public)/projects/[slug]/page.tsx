import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, projects } from "@/lib/db";
import { eq } from "drizzle-orm";

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
  };
}

export default async function ProjectDetail({ params }: Params) {
  const { slug } = await params;
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
    with: { images: true },
  });

  if (!project || project.status !== "live") notFound();

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <div className="crumbs">
            <a href="/">Home</a>
            &nbsp;&middot;&nbsp;
            <a href="/projects">Projects</a>
            &nbsp;&middot;&nbsp;
            {project.title}
          </div>
          <h1>
            {project.title.split("—")[0]}
            {project.title.includes("—") && (
              <>
                <br />
                <span className="it">{project.title.split("—")[1]?.trim()}</span>
              </>
            )}
          </h1>
          {project.summary && <p className="lede">{project.summary}</p>}
        </div>
      </section>

      {project.heroImage && (
        <section style={{ padding: "0 0 40px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.heroImage}
            alt={project.title}
            style={{ width: "100%", maxHeight: 640, objectFit: "cover" }}
          />
        </section>
      )}

      <section className="proj-grid-section">
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 40,
              borderTop: "1px solid var(--line-2)",
              borderBottom: "1px solid var(--line-2)",
              padding: "30px 0",
              fontSize: 14,
            }}
          >
            <div>
              <div className="eyebrow">Location</div>
              <div style={{ marginTop: 6 }}>{project.suburb || "—"}</div>
            </div>
            <div>
              <div className="eyebrow">Sector</div>
              <div style={{ marginTop: 6, textTransform: "capitalize" }}>
                {project.sector}
              </div>
            </div>
            <div>
              <div className="eyebrow">Package</div>
              <div style={{ marginTop: 6 }}>{project.packageValue || "—"}</div>
            </div>
          </div>
        </div>
      </section>

      {project.images && project.images.length > 0 && (
        <section className="gallery-section">
          <div className="wrap">
            <div className="gallery-grid">
              {project.images.map((img) => (
                <figure key={img.id} className="gallery-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt || ""} />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
