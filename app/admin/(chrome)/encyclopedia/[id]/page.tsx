import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db, encyclopediaEntries } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { PlantCare, PlantSeasons } from "@/lib/db/schema";
import { updateEntry, deleteEntry } from "../actions";

type Params = { params: Promise<{ id: string }> };

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TAGS = ["NATIVE", "DROUGHT", "FRAGRANT", "COASTAL", "SHADE"];

export default async function EditEncyclopediaEntryPage({ params }: Params) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const entryId = Number(id);
  if (!Number.isFinite(entryId)) notFound();

  const entry = await db.query.encyclopediaEntries.findFirst({
    where: eq(encyclopediaEntries.id, entryId),
  });
  if (!entry) notFound();

  const updateWithId = updateEntry.bind(null, entryId);
  const deleteWithId = deleteEntry.bind(null, entryId);

  const care = entry.care as PlantCare | null | undefined;
  const seasons = entry.seasons as PlantSeasons | null | undefined;
  const tags = (entry.tags as string[]) ?? [];
  const climateZones = ((entry.climateZones as string[]) ?? []).join(", ");
  const companions = ((entry.companions as string[]) ?? []).join(", ");
  const imagesJson = JSON.stringify(entry.images ?? [], null, 2);
  const floweringMonths = new Set(seasons?.flowering ?? []);
  const fruitingMonths = new Set(seasons?.fruiting ?? []);
  const presetTags = tags.filter((t) => TAGS.includes(t));
  const tagsRaw = tags.join(", ");

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1 style={{ fontStyle: "italic" }}>{entry.latinName}</h1>
          <div className="sub" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}>
            /encyclopedia/{entry.slug}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href={`/encyclopedia/${entry.slug}`} target="_blank" rel="noreferrer" className="btn sec">
            View ↗
          </a>
          <form action={deleteWithId}>
            <button
              type="submit"
              className="btn"
              style={{ background: "transparent", border: "1px solid var(--danger, #c0392b)", color: "var(--danger, #c0392b)" }}
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <form action={updateWithId}>
        <div style={{ display: "grid", gap: 20 }}>
          {/* Identity */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>Plant identity</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="field-label">Latin name *</label>
                <input className="field" name="latinName" required maxLength={200} defaultValue={entry.latinName} style={{ fontStyle: "italic" }} />
              </div>
              <div>
                <label className="field-label">Slug *</label>
                <input className="field mono" name="slug" required maxLength={200} defaultValue={entry.slug} pattern="[a-z0-9-]+" title="Lowercase letters, numbers, hyphens only" />
              </div>
              <div>
                <label className="field-label">Common name</label>
                <input className="field" name="commonName" maxLength={200} defaultValue={entry.commonName ?? ""} />
              </div>
              <div>
                <label className="field-label">Family</label>
                <input className="field" name="family" maxLength={100} defaultValue={entry.family ?? ""} />
              </div>
              <div>
                <label className="field-label">Genus</label>
                <input className="field" name="genus" maxLength={100} defaultValue={entry.genus ?? ""} />
              </div>
              <div>
                <label className="field-label">Climate zones (comma-separated)</label>
                <input className="field" name="climateZonesRaw" maxLength={500} defaultValue={climateZones} placeholder="temperate, coastal, subtropical" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>Tags</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
              {TAGS.map((tag) => (
                <label key={tag} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
                  <input type="checkbox" name="tag_preset" value={tag} defaultChecked={presetTags.includes(tag)} style={{ width: 15, height: 15 }} />
                  {tag}
                </label>
              ))}
            </div>
            <input className="field" name="tagsRaw" id="tags-raw" defaultValue={tagsRaw} maxLength={500} />
          </div>

          {/* Description */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>Description</h3>
            <textarea className="field" name="description" rows={8} maxLength={20000} defaultValue={entry.description ?? ""} style={{ resize: "vertical" }} />
          </div>

          {/* Care guide */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>Care guide</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="field-label">Watering</label>
                <input className="field" name="care_water" maxLength={200} defaultValue={care?.water ?? ""} />
              </div>
              <div>
                <label className="field-label">Light</label>
                <input className="field" name="care_light" maxLength={200} defaultValue={care?.light ?? ""} />
              </div>
              <div>
                <label className="field-label">Soil</label>
                <input className="field" name="care_soil" maxLength={200} defaultValue={care?.soil ?? ""} />
              </div>
              <div>
                <label className="field-label">Growth rate</label>
                <input className="field" name="care_growthRate" maxLength={200} defaultValue={care?.growthRate ?? ""} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Mature size</label>
                <input className="field" name="care_matureSize" maxLength={200} defaultValue={care?.matureSize ?? ""} />
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
                      <input type="checkbox" name="flowering_months" value={i + 1} defaultChecked={floweringMonths.has(i + 1)} style={{ width: 15, height: 15 }} />
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
                      <input type="checkbox" name="fruiting_months" value={i + 1} defaultChecked={fruitingMonths.has(i + 1)} style={{ width: 15, height: 15 }} />
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
                <input className="field mono" name="companionsRaw" maxLength={1000} defaultValue={companions} />
              </div>
              <div>
                <label className="field-label">Pest &amp; disease notes</label>
                <textarea className="field" name="pestNotes" rows={4} maxLength={5000} defaultValue={entry.pestNotes ?? ""} style={{ resize: "vertical" }} />
              </div>
              <div>
                <label className="field-label">Propagation</label>
                <textarea className="field" name="propagation" rows={4} maxLength={5000} defaultValue={entry.propagation ?? ""} style={{ resize: "vertical" }} />
              </div>
              <div>
                <label className="field-label">Landscape use</label>
                <textarea className="field" name="landscapeUse" rows={4} maxLength={5000} defaultValue={entry.landscapeUse ?? ""} style={{ resize: "vertical" }} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Images</h3>
            {(entry.images as Array<{ url: string; alt?: string }>).length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                {(entry.images as Array<{ url: string; alt?: string }>).map((img, i) => (
                  <div key={i}>
                    <img
                      src={img.url}
                      alt={img.alt ?? ""}
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)", display: "block", marginBottom: 4 }}
                    />
                    <span className="muted" style={{ fontSize: 11 }}>{img.alt || "(no alt)"}</span>
                  </div>
                ))}
              </div>
            )}
            <textarea className="field mono" name="imagesJson" rows={5} defaultValue={imagesJson} style={{ resize: "vertical", fontSize: 13 }} />
          </div>

          {/* Publishing */}
          <div className="panel" style={{ padding: "22px 24px" }}>
            <h3 style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}>Publishing</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="field-label">Status</label>
                <select className="field" name="status" defaultValue={entry.status}>
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 24 }}>
                <input type="checkbox" name="featured" id="featured" value="on" defaultChecked={entry.featured} style={{ width: 16, height: 16 }} />
                <label htmlFor="featured" style={{ fontSize: 14, cursor: "pointer" }}>Featured entry</label>
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--muted)" }}>
              Last updated:{" "}
              {new Date(entry.updatedAt).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn pri">Save changes</button>
            <a href="/admin/encyclopedia" className="btn sec">← Back</a>
          </div>
        </div>
      </form>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            const tagsRawEl = document.getElementById('tags-raw');
            document.querySelectorAll('input[name="tag_preset"]').forEach(cb => {
              cb.addEventListener('change', () => {
                const checked = Array.from(document.querySelectorAll('input[name="tag_preset"]:checked')).map(c => c.value);
                const custom = tagsRawEl.value.split(',').map(t => t.trim().toUpperCase()).filter(t => t && !${JSON.stringify(TAGS)}.includes(t));
                tagsRawEl.value = [...checked, ...custom].join(', ');
              });
            });
          `,
        }}
      />
    </main>
  );
}
