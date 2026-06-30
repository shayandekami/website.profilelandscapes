import { db, tradeAccounts } from "@/lib/db";
import { desc } from "drizzle-orm";
import { TradeRow } from "./TradeRow";

export const dynamic = "force-dynamic";

export default async function TradeAccountsAdmin() {
  const rows = await db.select().from(tradeAccounts).orderBy(desc(tradeAccounts.createdAt));
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>Trade <span className="it">accounts.</span></h1>
          <div className="sub">{rows.length} accounts{pending ? ` · ${pending} pending approval` : ""}. Set status and price tier — pricing applies on the next login.</div>
        </div>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", color: "var(--muted)" }}>
            No trade accounts yet. They register at <a href="/trade/register" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>/trade/register</a>.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted,#6b7280)", fontSize: 12 }}>
                <th style={{ padding: "10px 14px" }}>Company</th>
                <th style={{ padding: "10px 14px" }}>Contact</th>
                <th style={{ padding: "10px 14px" }}>Status</th>
                <th style={{ padding: "10px 14px" }}>Price tier</th>
                <th style={{ padding: "10px 14px" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => <TradeRow key={a.id} a={a} />)}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
