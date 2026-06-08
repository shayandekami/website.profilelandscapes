"use client";

import { useState, useTransition } from "react";
import type { SaveResult } from "@/app/admin/(chrome)/portfolio/actions";

type Project = {
  id: number;
  slug: string;
  title: string;
  suburb: string;
  sector: "residential" | "commercial" | "civic" | "healthcare" | "hospitality" | "other";
  principal: string;
  packageValue: string;
  summary: string;
  body: string;
  heroImage: string;
  featured: boolean;
  status: "draft" | "live";
  updatedAt: string;
};
type Image = { id: number; url: string; alt: string };

type Props = {
  project: Project;
  images: Image[];
  save: (input: unknown) => Promise<SaveResult>;
  remove: (id: number) => Promise<void>;
  addImage: (input: unknown) => Promise<
    { ok: true; image: { id: number; url: string; alt: string | null } } | { ok: false; error: string }
  >;
  removeImage: (id: number) => Promise<void>;
};

export function ProjectEditor({
  project: initial,
  images: initialImages,
  save,
  remove,
  addImage,
  removeImage,
}: Props) {
  const [p, setP] = useState(initial);
  const [imgs, setImgs] = useState(initialImages);
  const [newImgUrl, setNewImgUrl] = useState("");
  const [newImgAlt, setNewImgAlt] = useState("");
  const [msg, setMsg] = useState<{ text: string; kind: "idle" | "ok" | "err" | "saving" }>({
    text: "Last saved " + new Date(initial.updatedAt).toLocaleString("en-AU"),
    kind: "idle",
  });
  const [pending, startTransition] = useTransition();

  function set<K extends keyof Project>(k: K, v: Project[K]) {
    setP((s) => ({ ...s, [k]: v }));
  }

  function doSave(status?: "draft" | "live") {
    setMsg({ text: "Saving…", kind: "saving" });
    startTransition(async () => {
      const result = await save({
        ...p,
        status: status || p.status,
      });
      if (result.ok) {
        setMsg({ text: "Saved", kind: "ok" });
        if (status) set("status", status);
        set("updatedAt", result.updatedAt);
      } else {
        setMsg({ text: result.error, kind: "err" });
      }
    });
  }

  function doDelete() {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await remove(p.id);
    });
  }

  async function doAddImage() {
    if (!newImgUrl.trim()) return;
    const result = await addImage({
      projectId: p.id,
      url: newImgUrl.trim(),
      alt: newImgAlt.trim() || undefined,
    });
    if (result.ok) {
      setImgs((arr) => [...arr, { id: result.image.id, url: result.image.url, alt: result.image.alt || "" }]);
      setNewImgUrl("");
      setNewImgAlt("");
    } else {
      alert(result.error);
    }
  }

  async function doRemoveImage(id: number) {
    setImgs((arr) => arr.filter((i) => i.id !== id));
    await removeImage(id);
  }

  return (
    <>
      <div className="page-head-a" style={{ alignItems: "start" }}>
        <div style={{ flex: 1 }}>
          <div className={`status ${p.status === "live" ? "pub" : "drf"}`} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.14em", color: p.status === "live" ? "var(--sage)" : "var(--ochre)", textTransform: "uppercase", marginBottom: 8 }}>
            {p.status === "live"
              ? `Live · /projects/${p.slug}`
              : "Draft — not visible on the public site"}
          </div>
          <h1>{p.title || "Untitled project"}</h1>
          <div className="sub">
            Last saved{" "}
            <span style={{ color: msg.kind === "err" ? "var(--danger)" : msg.kind === "ok" ? "var(--sage)" : undefined }}>
              {msg.text}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn" href={`/projects/${p.slug}`} target="_blank" rel="noreferrer">
            View live
          </a>
          <button className="btn" disabled={pending} onClick={() => doSave()}>
            Save
          </button>
          <button className="btn pub" disabled={pending} onClick={() => doSave("live")}>
            {p.status === "live" ? "Republish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="detail-split">
        {/* Left — main fields */}
        <div className="dtl-card">
          <h4>Details</h4>
          <div className="dtl-sub">PUBLIC-FACING FIELDS</div>

          <div className="ed-field">
            <label>— Title</label>
            <input value={p.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div className="ed-field">
            <label>— URL slug</label>
            <input
              value={p.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            />
            <div className="helpt">Lowercase letters, numbers and hyphens. Shows as /projects/{p.slug || "…"}.</div>
          </div>

          <div className="ed-field">
            <label>— Summary</label>
            <textarea
              value={p.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={3}
            />
            <div className="helpt">2–3 sentences. Shown on the portfolio grid and at the top of the project detail page.</div>
          </div>

          <div className="ed-field">
            <label>— Body</label>
            <textarea
              value={p.body}
              onChange={(e) => set("body", e.target.value)}
              rows={8}
            />
            <div className="helpt">Full description. Plain text or simple HTML — rich editor lands in Phase 3.</div>
          </div>
        </div>

        {/* Right — metadata */}
        <div className="dtl-card">
          <h4>Metadata</h4>
          <div className="dtl-sub">CATEGORISATION &amp; STATUS</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="ed-field" style={{ margin: 0 }}>
              <label>— Suburb</label>
              <input value={p.suburb} onChange={(e) => set("suburb", e.target.value)} />
            </div>
            <div className="ed-field" style={{ margin: 0 }}>
              <label>— Sector</label>
              <select
                value={p.sector}
                onChange={(e) => set("sector", e.target.value as Project["sector"])}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="civic">Civic & Public</option>
                <option value="healthcare">Healthcare & Education</option>
                <option value="hospitality">Hospitality</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="ed-field">
            <label>— Principal / client</label>
            <input value={p.principal} onChange={(e) => set("principal", e.target.value)} />
          </div>

          <div className="ed-field">
            <label>— Package value</label>
            <input
              value={p.packageValue}
              placeholder="$2.4M"
              onChange={(e) => set("packageValue", e.target.value)}
            />
          </div>

          <div className="ed-field">
            <label>— Featured</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", textTransform: "none", letterSpacing: 0, color: "var(--ink)", fontSize: 14 }}>
              <input
                type="checkbox"
                checked={p.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Show prominently on the home + portfolio pages
            </label>
          </div>

          <div className="ed-field">
            <label>— Hero image</label>
            <input
              value={p.heroImage}
              placeholder="/assets/project-bench-terrace.png"
              onChange={(e) => set("heroImage", e.target.value)}
            />
            {p.heroImage && (
              <div style={{ marginTop: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.heroImage}
                  alt=""
                  style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 4, border: "1px solid var(--line)" }}
                />
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--line)", marginTop: 24, paddingTop: 20 }}>
            <button
              type="button"
              onClick={doDelete}
              style={{
                background: "transparent",
                color: "var(--danger)",
                border: "1px solid #e8c9c9",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Delete this project
            </button>
          </div>
        </div>
      </div>

      {/* Image gallery */}
      <div className="dtl-card" style={{ marginTop: 24 }}>
        <h4>Gallery</h4>
        <div className="dtl-sub">{imgs.length} IMAGE{imgs.length === 1 ? "" : "S"}</div>

        {imgs.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 14,
              marginTop: 16,
            }}
          >
            {imgs.map((img) => (
              <div key={img.id} style={{ position: "relative", border: "1px solid var(--line)", borderRadius: 4, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                <button
                  type="button"
                  onClick={() => doRemoveImage(img.id)}
                  title="Remove"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "rgba(255,255,255,0.95)",
                    border: "1px solid var(--line)",
                    borderRadius: 4,
                    width: 24,
                    height: 24,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  ✕
                </button>
                {img.alt && (
                  <div style={{ padding: "6px 8px", fontSize: 11.5, color: "var(--muted)", borderTop: "1px solid var(--line-2)", background: "#faf8f0" }}>
                    {img.alt}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20, padding: 16, background: "#faf8f0", borderRadius: 6 }}>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, letterSpacing: "0.14em", color: "var(--subtle)", textTransform: "uppercase", marginBottom: 10 }}>
            — ADD AN IMAGE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr auto", gap: 10 }}>
            <input
              placeholder="/uploads/your-image.jpg or paste URL"
              value={newImgUrl}
              onChange={(e) => setNewImgUrl(e.target.value)}
              style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 4, fontFamily: "inherit", fontSize: 14 }}
            />
            <input
              placeholder="Alt text (what's in the image)"
              value={newImgAlt}
              onChange={(e) => setNewImgAlt(e.target.value)}
              style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 4, fontFamily: "inherit", fontSize: 14 }}
            />
            <button className="btn pri" type="button" onClick={doAddImage} disabled={!newImgUrl.trim()}>
              Add
            </button>
          </div>
          <div className="helpt" style={{ marginTop: 8 }}>
            Use the Media Library to upload, or paste any image URL.
          </div>
        </div>
      </div>
    </>
  );
}
