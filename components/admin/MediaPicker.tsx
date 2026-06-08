"use client";

import { useEffect, useState } from "react";

type Item = { id: number; url: string; filename: string };

export function MediaPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((j) => setItems(j.items || []))
      .catch(() => setItems([]));
  }, [open]);

  async function upload(file: File) {
    setUploading(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await r.json();
    setUploading(false);
    if (!r.ok) {
      setErr(j.error || "Upload failed");
      return;
    }
    setItems((arr) => [{ id: j.id, url: j.url, filename: j.filename }, ...arr]);
    onChange(j.url);
    setOpen(false);
  }

  return (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/your-image.jpg or paste URL"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-sm"
          style={{ flexShrink: 0 }}
        >
          📁 Library
        </button>
      </div>
      {value && (
        <div style={{ marginTop: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            style={{ maxWidth: 200, maxHeight: 120, borderRadius: 4, border: "1px solid var(--line)" }}
          />
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(19,48,36,0.55)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 900,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 30px 60px -20px rgba(0,0,0,.35)",
            }}
          >
            <header
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 22 }}>
                  Media library
                </h3>
                <div className="sub" style={{ fontSize: 12.5, marginTop: 2 }}>
                  Upload a new image, or pick one already in the library.
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <label
                  className="btn-sm pri"
                  style={{ cursor: "pointer", opacity: uploading ? 0.6 : 1 }}
                >
                  {uploading ? "Uploading…" : "+ Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) upload(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button type="button" onClick={() => setOpen(false)} className="btn-sm">
                  Close
                </button>
              </div>
            </header>

            {err && (
              <div
                style={{
                  padding: "10px 22px",
                  background: "#fdf3eb",
                  color: "#8a4d10",
                  fontSize: 13,
                  borderBottom: "1px solid #ecc7a5",
                }}
              >
                {err}
              </div>
            )}

            <div style={{ padding: 22, overflowY: "auto", flex: 1 }}>
              {items.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>
                  No uploads yet. Click <b>+ Upload</b> to add one, or paste any
                  image URL directly into the field.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 12,
                  }}
                >
                  {items.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onChange(m.url);
                        setOpen(false);
                      }}
                      style={{
                        border: "1px solid var(--line)",
                        borderRadius: 4,
                        overflow: "hidden",
                        cursor: "pointer",
                        padding: 0,
                        background: "#fff",
                        outline: value === m.url ? "2px solid var(--sage)" : "none",
                        textAlign: "left",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt={m.filename}
                        style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
                      />
                      <div
                        style={{
                          padding: "6px 8px",
                          fontSize: 11,
                          color: "var(--ink-2)",
                          fontFamily: "'JetBrains Mono', monospace",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {m.filename}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
