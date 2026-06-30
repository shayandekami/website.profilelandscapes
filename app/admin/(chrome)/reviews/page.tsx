import { db, plantReviews } from "@/lib/db";
import { desc } from "drizzle-orm";
import { ReviewRow } from "./ReviewRow";

export const dynamic = "force-dynamic";

export default async function ReviewsAdmin() {
  const rows = await db.select().from(plantReviews).orderBy(desc(plantReviews.createdAt));
  const pending = rows.filter((r) => !r.approved);
  const approved = rows.filter((r) => r.approved);
  const ordered = [...pending, ...approved];

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>Plant <span className="it">reviews.</span></h1>
          <div className="sub">{pending.length} awaiting moderation · {approved.length} live. Approved reviews show on the plant page.</div>
        </div>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", color: "var(--muted)" }}>No reviews submitted yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted,#6b7280)", fontSize: 12 }}>
                <th style={{ padding: "10px 14px" }}>Rating</th>
                <th style={{ padding: "10px 14px" }}>Author / plant</th>
                <th style={{ padding: "10px 14px" }}>Comment</th>
                <th style={{ padding: "10px 14px" }}>Status</th>
                <th style={{ padding: "10px 14px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>{ordered.map((r) => <ReviewRow key={r.id} r={r} />)}</tbody>
          </table>
        )}
      </div>
    </main>
  );
}
