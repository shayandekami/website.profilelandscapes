import Link from "next/link";
import { db, encyclopediaEntries } from "@/lib/db";
import { asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EncyclopediaList() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const rows = await db
    .select()
    .from(encyclopediaEntries)
    .orderBy(asc(encyclopediaEntries.latinName));

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Plant <span className="it">encyclopedia.</span>
          </h1>
          <div className="sub">
            {rows.length} entr{rows.length !== 1 ? "ies" : "y"} in the botanical reference.
            Click any row to edit.
          </div>
        </div>
        <Link href="/admin/encyclopedia/new" className="btn pri">
          + New entry
        </Link>
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
            No encyclopedia entries yet.{" "}
            <Link href="/admin/encyclopedia/new" style={{ color: "var(--accent)" }}>
              Add the first one
            </Link>
            .
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Latin name</th>
                <th>Common name</th>
                <th>Family</th>
                <th>Tags</th>
                <th>Featured</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link
                      href={`/admin/encyclopedia/${e.id}`}
                      style={{ fontWeight: 500, color: "var(--ink)", fontStyle: "italic" }}
                    >
                      {e.latinName}
                    </Link>
                    <div className="sub" style={{ fontSize: 12.5 }}>
                      /encyclopedia/{e.slug}
                    </div>
                  </td>
                  <td>{e.commonName || <span className="muted">—</span>}</td>
                  <td>{e.family || <span className="muted">—</span>}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {((e.tags as string[]) ?? []).length === 0 ? (
                        <span className="muted">—</span>
                      ) : (
                        (e.tags as string[]).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              display: "inline-block",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              background: "var(--surface2, #f0f0f0)",
                              color: "var(--ink)",
                            }}
                          >
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>{e.featured ? "★" : <span className="muted">—</span>}</td>
                  <td>
                    <span className={`chip ${e.status === "live" ? "paid" : "draft"}`}>
                      {e.status}
                    </span>
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
