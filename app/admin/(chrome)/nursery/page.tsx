import Link from "next/link";
import { db, plants } from "@/lib/db";
import { asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function NurseryList() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const rows = await db
    .select()
    .from(plants)
    .orderBy(asc(plants.latinName));

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Nursery <span className="it">stock.</span>
          </h1>
          <div className="sub">
            {rows.length} plant{rows.length !== 1 ? "s" : ""} in stock. Click
            any row to edit.
          </div>
        </div>
        <Link href="/admin/nursery/new" className="btn pri">
          + New plant
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
            No plants yet.{" "}
            <Link href="/admin/nursery/new" style={{ color: "var(--accent)" }}>
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
                <th>Price</th>
                <th>Size</th>
                <th>Stock</th>
                <th>Tags</th>
                <th>Featured</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/admin/nursery/${p.id}`}
                      style={{ fontWeight: 500, color: "var(--ink)", fontStyle: "italic" }}
                    >
                      {p.latinName}
                    </Link>
                    <div className="sub" style={{ fontSize: 12.5 }}>
                      /nursery/{p.slug}
                    </div>
                  </td>
                  <td>{p.commonName || <span className="muted">—</span>}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatPrice(p.priceCents)}
                  </td>
                  <td>{p.size || <span className="muted">—</span>}</td>
                  <td
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color: p.stockQty === 0 ? "var(--danger, #c0392b)" : undefined,
                    }}
                  >
                    {p.stockQty === 0 ? "Out of stock" : p.stockQty}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {((p.tags as string[]) ?? []).length === 0 ? (
                        <span className="muted">—</span>
                      ) : (
                        (p.tags as string[]).map((tag) => (
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
                  <td>{p.featured ? "★" : <span className="muted">—</span>}</td>
                  <td>
                    <span className={`chip ${p.status === "live" ? "paid" : "draft"}`}>
                      {p.status}
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
