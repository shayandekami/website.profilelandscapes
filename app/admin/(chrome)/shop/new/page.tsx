import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db, productCategories } from "@/lib/db";
import { asc } from "drizzle-orm";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const categories = await db
    .select({ id: productCategories.id, name: productCategories.name })
    .from(productCategories)
    .orderBy(asc(productCategories.sortOrder));

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            New <span className="it">product.</span>
          </h1>
          <div className="sub">Fill in the details and click Save to create.</div>
        </div>
      </div>

      <form action={createProduct}>
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
                  placeholder="e.g. Premium Native Mix"
                  onFocus={undefined}
                  id="prod-name"
                />
              </div>
              <div>
                <label className="field-label">Slug *</label>
                <input
                  className="field mono"
                  name="slug"
                  required
                  maxLength={200}
                  placeholder="e.g. premium-native-mix"
                  id="prod-slug"
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
                  placeholder="e.g. NM-001"
                />
              </div>
              <div>
                <label className="field-label">Category</label>
                <select className="field" name="categoryId">
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
                  placeholder="0.00"
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
                  placeholder="0.00 (optional)"
                />
              </div>
              <div>
                <label className="field-label">Badge</label>
                <select className="field" name="badge">
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
                  defaultValue="100"
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
                  placeholder="One-line summary shown on listing cards"
                />
              </div>
              <div>
                <label className="field-label">Full description</label>
                <textarea
                  className="field"
                  name="description"
                  rows={8}
                  maxLength={20000}
                  placeholder="Rich product description (Markdown supported)"
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          </div>

          {/* Images (JSON) */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
              Images
            </h3>
            <p className="sub" style={{ marginBottom: 14, fontSize: 13 }}>
              Paste a JSON array of image objects:{" "}
              <code style={{ fontSize: 12 }}>
                {`[{"url":"https://...","alt":"desc"}]`}
              </code>
            </p>
            <textarea
              className="field mono"
              name="imagesJson"
              rows={4}
              placeholder='[{"url":"https://...","alt":"Product photo"}]'
              style={{ resize: "vertical", fontSize: 13 }}
              defaultValue="[]"
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
                <select className="field" name="status">
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
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn pri">
              Save product
            </button>
            <a href="/admin/shop" className="btn sec">
              Cancel
            </a>
          </div>
        </div>
      </form>

      {/* Auto-generate slug from name */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const nameEl = document.getElementById('prod-name');
            const slugEl = document.getElementById('prod-slug');
            let userEditedSlug = false;
            slugEl.addEventListener('input', () => { userEditedSlug = true; });
            nameEl.addEventListener('input', () => {
              if (userEditedSlug) return;
              slugEl.value = nameEl.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            });
          `,
        }}
      />
    </main>
  );
}
