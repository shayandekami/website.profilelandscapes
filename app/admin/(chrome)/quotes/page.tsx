import Link from "next/link";
import { db, quotes } from "@/lib/db";
import { desc } from "drizzle-orm";

export default async function QuotesInbox() {
  const rows = await db.select().from(quotes).orderBy(desc(quotes.receivedAt));

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Quote <span className="it">inbox.</span>
          </h1>
          <div className="sub">
            Enquiries from the website contact form. {rows.length} total.
          </div>
        </div>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", color: "var(--muted)" }}>
            No quotes yet. Submit a test enquiry on{" "}
            <a href="/contact" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
              /contact
            </a>{" "}
            to verify the flow.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Project</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id}>
                  <td>
                    <Link href={`/admin/quotes/${q.id}`} style={{ fontWeight: 500, color: "var(--ink)" }}>{q.name}</Link>
                    <div className="sub" style={{ marginTop: 4, fontSize: 12.5 }}>
                      <a href={`mailto:${q.email}`} style={{ color: "var(--accent)" }}>
                        {q.email}
                      </a>
                      {q.phone && ` · ${q.phone}`}
                    </div>
                  </td>
                  <td>{q.company || "—"}</td>
                  <td>
                    {q.sector || "—"}
                    {q.brief && (
                      <div className="sub" style={{ marginTop: 4, fontSize: 12.5 }}>
                        {q.brief.slice(0, 80)}
                        {q.brief.length > 80 ? "…" : ""}
                      </div>
                    )}
                  </td>
                  <td>{q.budget || "—"}</td>
                  <td>
                    <span className={`chip ${q.status === "new" ? "draft" : "paid"}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="mono muted">
                    {new Date(q.receivedAt).toLocaleString("en-AU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
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
