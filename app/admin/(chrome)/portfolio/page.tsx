import Link from "next/link";
import { db, projects } from "@/lib/db";
import { desc } from "drizzle-orm";
import { createProject } from "./actions";

export default async function PortfolioList() {
  const rows = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.featured), desc(projects.updatedAt));

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Project <span className="it">portfolio.</span>
          </h1>
          <div className="sub">
            Your public-facing work. Click any row to edit, or add a new
            project below.
          </div>
        </div>
        <form action={createProject}>
          <button className="btn pri" type="submit">
            + New project
          </button>
        </form>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <div
            style={{
              padding: "40px 22px",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            No projects yet. Click <b>+ New project</b> above to add one.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Project</th>
                <th>Suburb</th>
                <th>Sector</th>
                <th>Package</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/admin/portfolio/${p.id}`}
                      style={{ fontWeight: 500, color: "var(--ink)" }}
                    >
                      {p.title}
                    </Link>
                    <div className="sub" style={{ fontSize: 12.5 }}>
                      /projects/{p.slug}
                    </div>
                  </td>
                  <td>{p.suburb || "—"}</td>
                  <td style={{ textTransform: "capitalize" }}>{p.sector}</td>
                  <td>{p.packageValue || "—"}</td>
                  <td>
                    <span
                      className={`chip ${p.status === "live" ? "paid" : "draft"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{p.featured ? "★" : "—"}</td>
                  <td className="mono muted">
                    {new Date(p.updatedAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
