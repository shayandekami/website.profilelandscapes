import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db, products, productCategories } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { updateProduct, deleteProduct } from "../actions";

type Params = { params: Promise<{ id: string }> };

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default async function EditProductPage({ params }: Params) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  if (!product) notFound();

  const categories = await db
    .select({ id: productCategories.id, name: productCategories.name })
    .from(productCategories)
    .orderBy(asc(productCategories.sortOrder));

  const updateWithId = updateProduct.bind(null, productId);
  const deleteWithId = deleteProduct.bind(null, productId);

  const imagesJson = JSON.stringify(product.images ?? [], null, 2);

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Edit <span className="it">{product.name}</span>
          </h1>
          <div className="sub" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}>
            /shop/{product.slug}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href={`/shop/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn sec"
          >
            View ↗
          </a>
          <form action={deleteWithId}>
            <button
              type="submit"
              className="btn"
              style={{
                background: "transparent",
                border: "1px solid var(--danger, #c0392b)",
                color: "var(--danger, #c0392b)",
              }}
              onClick={undefined}
              formNoValidate
              data-confirm="Delete this product? This cannot be undone."
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <form action={updateWithId}>
        <div style={{ display: "grid", gap: 20 }}>
          {/* Core details */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Core details
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label className="field-label">Product name *</label>
                <input
                  className="field"
                  name="name"
                  required
                  maxLength={200}
                  defaultValue={product.name}
                />
              </div>
              <div>
                <label className="field-label">Slug *</label>
                <input
                  className="field mono"
                  name="slug"
                  required
                  maxLength={200}
                  defaultValue={product.slug}
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, hyphens only"
                />
              </div>
              <div>
                <label className="field-label">SKU</label>
                <input
                  className="field mono"
                  name="sku"
                  maxLength={80}
                  defaultValue={product.sku ?? ""}
                />
              </div>
              <div>
                <label className="field-label">Category</label>
                <select className="field" name="categoryId" defaultValue={product.categoryId ?? ""}>
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Price ($) *</label>
                <input
                  className="field"
                  name="priceDollars"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={formatPrice(product.priceCents)}
                />
              </div>
              <div>
                <label className="field-label">Compare-at price ($)</label>
                <input
                  className="field"
                  name="compareAtDollars"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={
                    product.compareAtCents != null
                      ? formatPrice(product.compareAtCents)
                      : ""
                  }
                />
              </div>
              <div>
                <label className="field-label">Badge</label>
                <select className="field" name="badge" defaultValue={product.badge ?? ""}>
                  <option value="">— None —</option>
                  <option value="NEW">NEW</option>
                  <option value="BEST">BEST</option>
                  <option value="SALE">SALE</option>
                </select>
              </div>
              <div>
                <label className="field-label">Stock quantity *</label>
                <input
                  className="field"
                  name="stockQty"
                  required
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={product.stockQty}
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Descriptions
            </h3>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="field-label">Short description</label>
                <input
                  className="field"
                  name="shortDescription"
                  maxLength={1000}
                  defaultValue={product.shortDescription ?? ""}
                />
              </div>
              <div>
                <label className="field-label">Full description</label>
                <textarea
                  className="field"
                  name="description"
                  rows={8}
                  maxLength={20000}
                  defaultValue={product.description ?? ""}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
              Images
            </h3>
            {(product.images ?? []).length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {(product.images as Array<{ url: string; alt?: string }>).map(
                  (img, i) => (
                    <div key={i} style={{ fontSize: 13 }}>
                      <img
                        src={img.url}
                        alt={img.alt ?? ""}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          display: "block",
                          marginBottom: 4,
                        }}
                        onError={undefined}
                      />
                      <span className="muted" style={{ fontSize: 11 }}>
                        {img.alt || "(no alt)"}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
            <p className="sub" style={{ marginBottom: 10, fontSize: 13 }}>
              Edit the JSON array below to add, remove, or reorder images.
            </p>
            <textarea
              className="field mono"
              name="imagesJson"
              rows={6}
              defaultValue={imagesJson}
              style={{ resize: "vertical", fontSize: 13 }}
            />
          </div>

          {/* Publishing */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Publishing
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label className="field-label">Status</label>
                <select className="field" name="status" defaultValue={product.status}>
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                </select>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingTop: 24,
                }}
              >
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  value="on"
                  defaultChecked={product.featured}
                  style={{ width: 16, height: 16 }}
                />
                <label
                  htmlFor="featured"
                  style={{ fontSize: 14, cursor: "pointer" }}
                >
                  Featured product
                </label>
              </div>
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 12.5,
                color: "var(--muted)",
              }}
            >
              Last updated:{" "}
              {new Date(product.updatedAt).toLocaleString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn pri">
              Save changes
            </button>
            <a href="/admin/shop" className="btn sec">
              ← Back
            </a>
          </div>
        </div>
      </form>
    </main>
  );
}
