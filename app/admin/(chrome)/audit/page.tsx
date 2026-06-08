import { db, auditLog, users } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      resource: auditLog.resource,
      resourceId: auditLog.resourceId,
      meta: auditLog.meta,
      createdAt: auditLog.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(200);

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Audit <span className="it">log.</span>
          </h1>
          <div className="sub">
            Every admin write, with who did it and when. Showing the most
            recent 200 entries.
          </div>
        </div>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <div style={{ padding: "40px 22px", color: "var(--muted)", textAlign: "center" }}>
            No audit entries yet.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono muted">
                    {new Date(r.createdAt).toLocaleString("en-AU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    {r.userName || "—"}
                    <div className="sub" style={{ fontSize: 12 }}>{r.userEmail}</div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 12.5 }}>{r.action}</span>
                  </td>
                  <td className="muted" style={{ fontSize: 13 }}>
                    {r.resource || "—"}
                    {r.resourceId && <span className="mono"> · #{r.resourceId}</span>}
                  </td>
                  <td className="muted" style={{ fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace" }}>
                    {r.meta ? JSON.stringify(r.meta) : "—"}
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
