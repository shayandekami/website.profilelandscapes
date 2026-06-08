import Link from "next/link";
import { db, pages } from "@/lib/db";
import { desc } from "drizzle-orm";

export default async function PagesList() {
  const rows = await db
    .select()
    .from(pages)
    .orderBy(desc(pages.updatedAt));

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Site <span className="it">pages.</span>
          </h1>
          <div className="sub">
            The pages your visitors see. Click any row to edit its content,
            then publish to push live.
          </div>
        </div>
      </div>

      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th>Page</th>
              <th>URL</th>
              <th>Sections</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link
                    href={`/admin/pages/${p.id}`}
                    style={{ fontWeight: 500, color: "var(--ink)" }}
                  >
                    {p.title}
                  </Link>
                  {p.lede && (
                    <div className="sub" style={{ marginTop: 4, fontSize: 12.5 }}>
                      {p.lede.slice(0, 100)}
                      {p.lede.length > 100 ? "…" : ""}
                    </div>
                  )}
                </td>
                <td className="mono muted">{p.slug}</td>
                <td>{(p.sections as unknown[]).length}</td>
                <td>
                  <span className={`chip ${p.status === "live" ? "paid" : "draft"}`}>
                    {p.status === "live" ? "Live" : "Draft"}
                  </span>
                </td>
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
      </div>
    </main>
  );
}
