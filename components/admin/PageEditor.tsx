"use client";

import { useState, useTransition } from "react";
import type { Section } from "@/lib/db";
import { sectionSchemas, ALL_SECTION_TYPES, type Field } from "./section-schemas";
import type { SaveResult } from "@/app/admin/(chrome)/pages/[id]/actions";
import { MediaPicker } from "./MediaPicker";
import { RichTextEditor } from "./RichTextEditor";

type PageInput = {
  id: number;
  slug: string;
  title: string;
  lede: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "live";
  sections: Section[];
  updatedAt: string;
};

type Props = {
  page: PageInput;
  save: (input: unknown) => Promise<SaveResult>;
};

export function PageEditor({ page: initial, save }: Props) {
  const [page, setPage] = useState<PageInput>(initial);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [showAdd, setShowAdd] = useState(false);
  const [saveState, setSaveState] = useState<{
    msg: string;
    kind: "idle" | "saving" | "ok" | "err";
  }>({ msg: "Saved " + relTime(initial.updatedAt), kind: "idle" });
  const [pending, startTransition] = useTransition();

  function patchPage<K extends keyof PageInput>(key: K, value: PageInput[K]) {
    setPage((p) => ({ ...p, [key]: value }));
  }

  function patchSection(idx: number, patch: Partial<Section>) {
    setPage((p) => {
      const next = [...p.sections];
      next[idx] = { ...next[idx], ...patch };
      return { ...p, sections: next };
    });
  }

  function patchSectionProps(idx: number, key: string, value: unknown) {
    setPage((p) => {
      const next = [...p.sections];
      next[idx] = {
        ...next[idx],
        props: { ...next[idx].props, [key]: value },
      };
      return { ...p, sections: next };
    });
  }

  function moveSection(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= page.sections.length) return;
    setPage((p) => {
      const next = [...p.sections];
      [next[idx], next[j]] = [next[j], next[idx]];
      return { ...p, sections: next };
    });
    setOpenIdx(j);
  }

  function deleteSection(idx: number) {
    if (!confirm("Remove this section? You can recover from the revision history.")) return;
    setPage((p) => ({ ...p, sections: p.sections.filter((_, i) => i !== idx) }));
    setOpenIdx(null);
  }

  function addSection(type: string) {
    setPage((p) => ({
      ...p,
      sections: [...p.sections, { type, props: {} }],
    }));
    setOpenIdx(page.sections.length);
    setShowAdd(false);
  }

  function doSave(status?: "draft" | "live") {
    setSaveState({ msg: "Saving…", kind: "saving" });
    startTransition(async () => {
      const result = await save({
        id: page.id,
        title: page.title,
        lede: page.lede || undefined,
        seoTitle: page.seoTitle || undefined,
        seoDescription: page.seoDescription || undefined,
        status: status || page.status,
        sections: page.sections,
      });
      if (result.ok) {
        setSaveState({ msg: "Saved just now", kind: "ok" });
        if (status) patchPage("status", status);
        patchPage("updatedAt", result.updatedAt);
      } else {
        setSaveState({ msg: result.error, kind: "err" });
      }
    });
  }

  return (
    <div className="editor-layout">
      {/* Left rail — section list */}
      <aside className="ed-tree">
        <h6>— SECTIONS</h6>
        {page.sections.map((s, i) => {
          const schema = sectionSchemas[s.type];
          return (
            <div
              key={i}
              className={`ent ${openIdx === i ? "on" : ""}`}
              onClick={() => setOpenIdx(i)}
              style={{ cursor: "pointer" }}
            >
              <div className="dot"></div>
              <span style={{ flex: 1 }}>
                {schema?.label || s.type}
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {previewFirstField(s)}
                </div>
              </span>
              <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                <button
                  className="iconbtn-mini"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(i, -1);
                  }}
                  disabled={i === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  className="iconbtn-mini"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(i, 1);
                  }}
                  disabled={i === page.sections.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 16 }}>
          {!showAdd ? (
            <button
              className="btn"
              onClick={() => setShowAdd(true)}
              style={{ width: "100%" }}
            >
              + Add section
            </button>
          ) : (
            <div style={{ display: "grid", gap: 4 }}>
              {ALL_SECTION_TYPES.map((t) => (
                <button
                  key={t}
                  className="btn-sm"
                  onClick={() => addSection(t)}
                  style={{ justifyContent: "flex-start" }}
                >
                  {sectionSchemas[t]?.label || t}
                </button>
              ))}
              <button className="btn-sm" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <h6 style={{ marginTop: 24 }}>— PAGE</h6>
        <div className="page-meta-mini">
          <div>
            <label>URL</label>
            <div className="mono muted">{page.slug}</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Status</label>
            <div>
              <span className={`chip ${page.status === "live" ? "paid" : "draft"}`}>
                {page.status === "live" ? "Live" : "Draft"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main edit pane */}
      <section className="ed-main">
        <div className="ed-head">
          <div>
            <div className={`status ${page.status === "live" ? "pub" : "drf"}`}>
              {page.status === "live"
                ? `Live · profilelandscapes.com.au${page.slug === "/" ? "" : page.slug}`
                : "Draft — not visible to the public"}
            </div>
            <h1>{page.title}</h1>
            <div className="subline">
              LAST UPDATED {new Date(page.updatedAt).toLocaleString("en-AU")}
            </div>
          </div>
          <div className="ed-actions">
            <span
              className="savechip"
              data-state={saveState.kind}
              style={{
                color: saveState.kind === "err" ? "#c2783a" : undefined,
              }}
            >
              {saveState.msg}
            </span>
            <a
              className="btn"
              href={page.slug === "/" ? "/" : page.slug}
              target="_blank"
              rel="noreferrer"
            >
              View live
            </a>
            <button
              className="btn"
              disabled={pending}
              onClick={() => doSave()}
            >
              Save draft
            </button>
            <button
              className="btn pub"
              disabled={pending}
              onClick={() => doSave("live")}
            >
              {page.status === "live" ? "Publish changes" : "Publish"}
            </button>
          </div>
        </div>

        <div className="ed-field">
          <label>— Page title</label>
          <input
            className="big"
            value={page.title}
            onChange={(e) => patchPage("title", e.target.value)}
          />
          <div className="helpt">Shown as the browser tab title and the hero heading on some pages.</div>
        </div>

        <div className="ed-field">
          <label>— Lede / summary</label>
          <textarea
            value={page.lede}
            onChange={(e) => patchPage("lede", e.target.value)}
            rows={2}
          />
          <div className="helpt">One-sentence summary. Also used as the meta description if SEO description is empty.</div>
        </div>

        <details className="ed-collapse" style={{ marginBottom: 22 }}>
          <summary>SEO &amp; search</summary>
          <div className="ed-field">
            <label>— SEO title</label>
            <input
              value={page.seoTitle}
              onChange={(e) => patchPage("seoTitle", e.target.value)}
            />
            <div className="helpt">Browser tab + Google result title. Falls back to Page title.</div>
          </div>
          <div className="ed-field">
            <label>— SEO description</label>
            <textarea
              value={page.seoDescription}
              onChange={(e) => patchPage("seoDescription", e.target.value)}
              rows={2}
            />
            <div className="helpt">Snippet shown under the title in Google. ~155 characters.</div>
          </div>
        </details>

        <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "24px 0" }} />

        {/* Section editor */}
        {openIdx === null && (
          <p style={{ color: "var(--muted)", padding: "20px 0" }}>
            Select a section from the left to edit it.
          </p>
        )}
        {openIdx !== null && page.sections[openIdx] && (
          <SectionEditor
            section={page.sections[openIdx]}
            onChange={(patch) => patchSection(openIdx, patch)}
            onChangeProps={(key, value) => patchSectionProps(openIdx, key, value)}
            onDelete={() => deleteSection(openIdx)}
          />
        )}
      </section>
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
  onChangeProps,
  onDelete,
}: {
  section: Section;
  onChange: (patch: Partial<Section>) => void;
  onChangeProps: (key: string, value: unknown) => void;
  onDelete: () => void;
}) {
  const schema = sectionSchemas[section.type];

  if (!schema) {
    return (
      <div style={{ background: "#fff8e6", padding: 16, borderRadius: 4, border: "1px dashed #d9b96b" }}>
        Unknown section type &ldquo;{section.type}&rdquo;. Edit raw JSON or change the type:
        <select
          value={section.type}
          onChange={(e) => onChange({ type: e.target.value })}
          style={{ marginLeft: 8 }}
        >
          {ALL_SECTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)", textTransform: "uppercase" }}>
            — {schema.label.toUpperCase()} SECTION
          </div>
          <p className="helpt" style={{ marginTop: 4 }}>{schema.description}</p>
        </div>
        <button className="btn-sm" onClick={onDelete} title="Remove this section">
          ✕ Remove
        </button>
      </div>

      {schema.fields.length === 0 && (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          This section has no editable fields — it renders automatically.
        </p>
      )}

      {schema.fields.map((f) => (
        <FieldEditor
          key={f.key}
          field={f}
          value={(section.props as Record<string, unknown>)[f.key]}
          onChange={(v) => onChangeProps(f.key, v)}
        />
      ))}
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "text" || field.type === "url") {
    return (
      <div className="ed-field">
        <label>— {field.label}</label>
        <input
          value={(value as string) || ""}
          placeholder={"placeholder" in field ? field.placeholder : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.help && <div className="helpt">{field.help}</div>}
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="ed-field">
        <label>— {field.label}</label>
        <textarea
          value={(value as string) || ""}
          rows={field.rows || 4}
          placeholder={"placeholder" in field ? field.placeholder : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.help && <div className="helpt">{field.help}</div>}
      </div>
    );
  }
  if (field.type === "richtext") {
    return (
      <div className="ed-field">
        <label>— {field.label}</label>
        <RichTextEditor value={(value as string) || ""} onChange={(v) => onChange(v)} />
        {field.help && <div className="helpt">{field.help}</div>}
      </div>
    );
  }
  if (field.type === "image") {
    return (
      <div className="ed-field">
        <label>— {field.label}</label>
        <MediaPicker
          value={(value as string) || ""}
          onChange={(v) => onChange(v)}
        />
        <div className="helpt">
          {field.help || "Pick from the media library, upload a new file, or paste a URL."}
        </div>
      </div>
    );
  }
  if (field.type === "object") {
    const obj = (value as Record<string, unknown>) || {};
    return (
      <div className="ed-field">
        <label>— {field.label}</label>
        <div style={{ borderLeft: "2px solid var(--line)", paddingLeft: 16, marginTop: 8 }}>
          {field.fields.map((f) => (
            <FieldEditor
              key={f.key}
              field={f}
              value={obj[f.key]}
              onChange={(v) => onChange({ ...obj, [f.key]: v })}
            />
          ))}
        </div>
      </div>
    );
  }
  if (field.type === "list") {
    const arr = (value as Record<string, unknown>[]) || [];
    return (
      <div className="ed-field">
        <label>— {field.label}</label>
        <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
          {arr.map((item, i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 4,
                padding: "14px 16px",
                background: "#fbf9f3",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--muted)" }}>
                  — ITEM {i + 1}
                </span>
                <button
                  className="btn-sm"
                  onClick={() => onChange(arr.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
              {field.itemFields.map((f) => (
                <FieldEditor
                  key={f.key}
                  field={f}
                  value={item[f.key]}
                  onChange={(v) => {
                    const next = [...arr];
                    next[i] = { ...item, [f.key]: v };
                    onChange(next);
                  }}
                />
              ))}
            </div>
          ))}
          <button
            className="btn-sm"
            style={{ justifySelf: "start" }}
            onClick={() => onChange([...arr, {}])}
          >
            + Add item
          </button>
        </div>
        {field.help && <div className="helpt">{field.help}</div>}
      </div>
    );
  }
  return null;
}

function previewFirstField(s: Section): string {
  const p = s.props as Record<string, unknown>;
  const candidates = ["title", "headline", "eyebrow", "html"];
  for (const k of candidates) {
    const v = p[k];
    if (typeof v === "string" && v.trim()) return v.slice(0, 50);
  }
  return "";
}

function relTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}
