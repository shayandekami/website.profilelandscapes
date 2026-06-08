import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createPlant } from "../actions";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TAGS = ["NATIVE", "DROUGHT", "FRAGRANT", "COASTAL", "SHADE"];

export default async function NewPlantPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            New <span className="it">plant.</span>
          </h1>
          <div className="sub">Fill in the details and click Save to create.</div>
        </div>
      </div>

      <form action={createPlant}>
        <div style={{ display: "grid", gap: 20 }}>
          {/* Identity */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Plant identity
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label className="field-label">Latin name *</label>
                <input
                  className="field"
                  name="latinName"
                  id="plant-latin"
                  required
                  maxLength={200}
                  placeholder="e.g. Grevillea robusta"
                  style={{ fontStyle: "italic" }}
                />
              </div>
              <div>
                <label className="field-label">Slug *</label>
                <input
                  className="field mono"
                  name="slug"
                  id="plant-slug"
                  required
                  maxLength={200}
                  placeholder="e.g. grevillea-robusta"
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, hyphens only"
                />
              </div>
              <div>
                <label className="field-label">Common name</label>
                <input
                  className="field"
                  name="commonName"
                  maxLength={200}
                  placeholder="e.g. Silky Oak"
                />
              </div>
              <div>
                <label className="field-label">Family</label>
                <input
                  className="field"
                  name="family"
                  maxLength={100}
                  placeholder="e.g. Proteaceae"
                />
              </div>
            </div>
          </div>

          {/* Stock & pricing */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Stock &amp; pricing
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
              }}
            >
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
                <label className="field-label">Size</label>
                <input
                  className="field"
                  name="size"
                  maxLength={100}
                  placeholder="e.g. 200mm pot"
                />
              </div>
              <div>
                <label className="field-label">Stock qty *</label>
                <input
                  className="field"
                  name="stockQty"
                  required
                  type="number"
                  min="0"
                  step="1"
                  defaultValue="0"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>
              Tags
            </h3>
            <p className="sub" style={{ marginBottom: 14, fontSize: 13 }}>
              Select all that apply. Or enter custom tags (comma-separated) below.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
              {TAGS.map((tag) => (
                <label
                  key={tag}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}
                >
                  <input type="checkbox" name="tag_preset" value={tag} style={{ width: 15, height: 15 }} />
                  {tag}
                </label>
              ))}
            </div>
            <input
              className="field"
              name="tagsRaw"
              id="tags-raw"
              placeholder="NATIVE, DROUGHT, FRAGRANT (or custom tags)"
              maxLength={500}
            />
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
                  placeholder="One-line summary for listing cards"
                />
              </div>
              <div>
                <label className="field-label">Full description</label>
                <textarea
                  className="field"
                  name="description"
                  rows={6}
                  maxLength={20000}
                  placeholder="Full care guide and description (Markdown supported)"
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          </div>

          {/* Care guide */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Care guide
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label className="field-label">Watering</label>
                <input
                  className="field"
                  name="care_water"
                  maxLength={200}
                  placeholder="e.g. Low — drought tolerant once established"
                />
              </div>
              <div>
                <label className="field-label">Light</label>
                <input
                  className="field"
                  name="care_light"
                  maxLength={200}
                  placeholder="e.g. Full sun to part shade"
                />
              </div>
              <div>
                <label className="field-label">Soil</label>
                <input
                  className="field"
                  name="care_soil"
                  maxLength={200}
                  placeholder="e.g. Well-drained, sandy loam"
                />
              </div>
              <div>
                <label className="field-label">Growth rate</label>
                <input
                  className="field"
                  name="care_growthRate"
                  maxLength={200}
                  placeholder="e.g. Fast — 1–2m per year"
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Mature size</label>
                <input
                  className="field"
                  name="care_matureSize"
                  maxLength={200}
                  placeholder="e.g. 10–15m tall × 4–6m wide"
                />
              </div>
            </div>
          </div>

          {/* Seasons */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Seasons
            </h3>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="field-label" style={{ marginBottom: 8 }}>
                  Flowering months
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {MONTHS.map((m, i) => (
                    <label
                      key={m}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer", width: 36 }}
                    >
                      <input
                        type="checkbox"
                        name="flowering_months"
                        value={i + 1}
                        style={{ width: 15, height: 15 }}
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label" style={{ marginBottom: 8 }}>
                  Fruiting months
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {MONTHS.map((m, i) => (
                    <label
                      key={m}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer", width: 36 }}
                    >
                      <input
                        type="checkbox"
                        name="fruiting_months"
                        value={i + 1}
                        style={{ width: 15, height: 15 }}
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Relationships */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Relationships
            </h3>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="field-label">Companion plants (comma-separated slugs)</label>
                <input
                  className="field mono"
                  name="companionsRaw"
                  maxLength={1000}
                  placeholder="e.g. acacia-dealbata, banksia-integrifolia"
                />
              </div>
              <div>
                <label className="field-label">Encyclopedia entry slug (optional)</label>
                <input
                  className="field mono"
                  name="encyclopediaSlug"
                  maxLength={200}
                  placeholder="e.g. grevillea-robusta"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
              Images
            </h3>
            <p className="sub" style={{ marginBottom: 10, fontSize: 13 }}>
              JSON array:{" "}
              <code style={{ fontSize: 12 }}>
                {`[{"url":"https://...","alt":"desc"}]`}
              </code>
            </p>
            <textarea
              className="field mono"
              name="imagesJson"
              rows={4}
              defaultValue="[]"
              style={{ resize: "vertical", fontSize: 13 }}
            />
          </div>

          {/* Publishing */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Publishing
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="field-label">Status</label>
                <select className="field" name="status">
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 24 }}>
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  value="on"
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="featured" style={{ fontSize: 14, cursor: "pointer" }}>
                  Featured plant
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn pri">
              Save plant
            </button>
            <a href="/admin/nursery" className="btn sec">
              Cancel
            </a>
          </div>
        </div>
      </form>

      {/* Slug auto-generation + tag preset sync */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const latinEl = document.getElementById('plant-latin');
            const slugEl = document.getElementById('plant-slug');
            const tagsRawEl = document.getElementById('tags-raw');
            let userEditedSlug = false;
            slugEl.addEventListener('input', () => { userEditedSlug = true; });
            latinEl.addEventListener('input', () => {
              if (userEditedSlug) return;
              slugEl.value = latinEl.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            });
            document.querySelectorAll('input[name="tag_preset"]').forEach(cb => {
              cb.addEventListener('change', () => {
                const checked = Array.from(document.querySelectorAll('input[name="tag_preset"]:checked')).map(c => c.value);
                tagsRawEl.value = checked.join(', ');
              });
            });
          `,
        }}
      />
    </main>
  );
}
