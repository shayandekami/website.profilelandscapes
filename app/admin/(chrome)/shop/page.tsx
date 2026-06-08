import Link from "next/link";
import { db, products, productCategories } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function ShopList() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      priceCents: products.priceCents,
      stockQty: products.stockQty,
      badge: products.badge,
      featured: products.featured,
      status: products.status,
      createdAt: products.createdAt,
      categoryId: products.categoryId,
      categoryName: productCategories.name,
    })
    .from(products)
    .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
    .orderBy(desc(products.createdAt));

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Shop <span className="it">products.</span>
          </h1>
          <div className="sub">
            {rows.length} product{rows.length !== 1 ? "s" : ""} in the store.
            Click any row to edit, or add a new product below.
          </div>
        </div>
        <Link href="/admin/shop/new" className="btn pri">
          + New product
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
            No products yet.{" "}
            <Link href="/admin/shop/new" style={{ color: "var(--accent)" }}>
              Add the first one
            </Link>
            .
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Badge</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/admin/shop/${p.id}`}
                      style={{ fontWeight: 500, color: "var(--ink)" }}
                    >
                      {p.name}
                    </Link>
                    <div className="sub" style={{ fontSize: 12.5 }}>
                      {p.sku && <span style={{ marginRight: 6 }}>SKU: {p.sku}</span>}
                      /shop/{p.slug}
                    </div>
                  </td>
                  <td>{p.categoryName || <span className="muted">—</span>}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatPrice(p.priceCents)}
                  </td>
                  <td
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color: p.stockQty === 0 ? "var(--danger, #c0392b)" : undefined,
                    }}
                  >
                    {p.stockQty === 0 ? "Out of stock" : p.stockQty}
                  </td>
                  <td>
                    {p.badge ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 7px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            p.badge === "SALE"
                              ? "#fde8e8"
                              : p.badge === "NEW"
                              ? "#e8f4ff"
                              : "#e8f8e8",
                          color:
                            p.badge === "SALE"
                              ? "#c0392b"
                              : p.badge === "NEW"
                              ? "#1a6fb5"
                              : "#218739",
                        }}
                      >
                        {p.badge}
                      </span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>{p.featured ? "★" : <span className="muted">—</span>}</td>
                  <td>
                    <span className={`chip ${p.status === "live" ? "paid" : "draft"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/admin/shop/${p.id}`}
                      style={{ color: "var(--accent)", fontSize: 13 }}
                    >
                      Edit
                    </Link>
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
