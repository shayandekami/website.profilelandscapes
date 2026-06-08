import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createEntry } from "../actions";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TAGS = ["NATIVE", "DROUGHT", "FRAGRANT", "COASTAL", "SHADE"];

export default async function NewEncyclopediaEntryPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            New encyclopedia <span className="it">entry.</span>
          </h1>
          <div className="sub">Add a botanical reference entry.</div>
        </div>
      </div>

      <form action={createEntry}>
        <div style={{ display: "grid", gap: 20 }}>
          {/* Identity */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>
              Plant identity
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="field-label">Latin name *</label>
                <input
                  className="field"
                  name="latinName"
                  id="enc-latin"
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
                  id="enc-slug"
                  required
                  maxLength={200}
                  placeholder="e.g. grevillea-robusta"
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, hyphens only"
                />
              </div>
              <div>
                <label className="field-label">Common name</label>
                <input className="field" name="commonName" maxLength={200} placeholder="e.g. Silky Oak" />
              </div>
              <div>
                <label className="field-label">Family</label>
                <input className="field" name="family" maxLength={100} placeholder="e.g. Proteaceae" />
              </div>
              <div>
                <label className="field-label">Genus</label>
                <input className="field" name="genus" maxLength={100} placeholder="e.g. Grevillea" />
              </div>
              <div>
                <label className="field-label">Climate zones (comma-separated)</label>
                <input
                  className="field"
                  name="climateZonesRaw"
                  maxLength={500}
                  placeholder="e.g. temperate, coastal, subtropical"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>Tags</h3>
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
              placeholder="NATIVE, DROUGHT, FRAGRANT (comma-separated)"
              maxLength={500}
            />
          </div>

          {/* Description */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>Description</h3>
            <textarea
              className="field"
              name="description"
              rows={8}
              maxLength={20000}
              placeholder="Full botanical description and growing notes (Markdown supported)"
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Care guide */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>Care guide</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="field-label">Watering</label>
                <input className="field" name="care_water" maxLength={200} placeholder="e.g. Low — drought tolerant" />
              </div>
              <div>
                <label className="field-label">Light</label>
                <input className="field" name="care_light" maxLength={200} placeholder="e.g. Full sun to part shade" />
              </div>
              <div>
                <label className="field-label">Soil</label>
                <input className="field" name="care_soil" maxLength={200} placeholder="e.g. Well-drained, sandy loam" />
              </div>
              <div>
                <label className="field-label">Growth rate</label>
                <input className="field" name="care_growthRate" maxLength={200} placeholder="e.g. Fast — 1–2m per year" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Mature size</label>
                <input className="field" name="care_matureSize" maxLength={200} placeholder="e.g. 10–15m tall × 4–6m wide" />
              </div>
            </div>
          </div>

          {/* Seasons */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>Seasons</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="field-label" style={{ marginBottom: 8 }}>Flowering months</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {MONTHS.map((m, i) => (
                    <label key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer", width: 36 }}>
                      <input type="checkbox" name="flowering_months" value={i + 1} style={{ width: 15, height: 15 }} />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label" style={{ marginBottom: 8 }}>Fruiting months</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {MONTHS.map((m, i) => (
                    <label key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer", width: 36 }}>
                      <input type="checkbox" name="fruiting_months" value={i + 1} style={{ width: 15, height: 15 }} />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional notes */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>Additional notes</h3>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="field-label">Companion plants (comma-separated slugs)</label>
                <input className="field mono" name="companionsRaw" maxLength={1000} placeholder="e.g. acacia-dealbata, banksia-integrifolia" />
              </div>
              <div>
                <label className="field-label">Pest &amp; disease notes</label>
                <textarea className="field" name="pestNotes" rows={4} maxLength={5000} style={{ resize: "vertical" }} />
              </div>
              <div>
                <label className="field-label">Propagation</label>
                <textarea className="field" name="propagation" rows={4} maxLength={5000} style={{ resize: "vertical" }} />
              </div>
              <div>
                <label className="field-label">Landscape use</label>
                <textarea className="field" name="landscapeUse" rows={4} maxLength={5000} style={{ resize: "vertical" }} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Images</h3>
            <p className="sub" style={{ marginBottom: 10, fontSize: 13 }}>
              JSON array: <code style={{ fontSize: 12 }}>{`[{"url":"https://...","alt":"desc"}]`}</code>
            </p>
            <textarea className="field mono" name="imagesJson" rows={4} defaultValue="[]" style={{ resize: "vertical", fontSize: 13 }} />
          </div>

          {/* Publishing */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>Publishing</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="field-label">Status</label>
                <select className="field" name="status">
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 24 }}>
                <input type="checkbox" name="featured" id="featured" value="on" style={{ width: 16, height: 16 }} />
                <label htmlFor="featured" style={{ fontSize: 14, cursor: "pointer" }}>Featured entry</label>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn pri">Save entry</button>
            <a href="/admin/encyclopedia" className="btn sec">Cancel</a>
          </div>
        </div>
      </form>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const latinEl = document.getElementById('enc-latin');
            const slugEl = document.getElementById('enc-slug');
            const tagsRawEl = document.getElementById('tags-raw');
            let userEditedSlug = false;
            slugEl.addEventListener('input', () => { userEditedSlug = true; });
            latinEl.addEventListener('input', () => {
              if (userEditedSlug) return;
              slugEl.value = latinEl.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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
