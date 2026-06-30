"use client";

import { useState, useTransition } from "react";
import { restoreRevision } from "@/app/admin/(chrome)/pages/[id]/actions";

type Rev = { id: number; title: string; sectionCount: number; author: string | null; createdAt: string };

export function RevisionsPanel({ pageId, revisions }: { pageId: number; revisions: Rev[] }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  function restore(revisionId: number) {
    if (!confirm("Restore this version? The current content is snapshotted first, so you can undo.")) return;
    start(async () => {
      const r = await restoreRevision({ pageId, revisionId });
      if (r.ok) { setMsg("Restored — reloading…"); setTimeout(() => location.reload(), 600); }
      else setMsg(r.error);
    });
  }

  return (
    <div style={{ borderTop: "1px solid var(--line,#e5e7eb)", marginTop: 8 }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", textAlign: "left", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--ink,#133024)", display: "flex", justifyContent: "space-between" }}>
        <span>Version history ({revisions.length})</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 14px" }}>
          {msg && <div style={{ fontSize: 12.5, color: "var(--accent,#1f5a3d)", marginBottom: 8 }}>{msg}</div>}
          {revisions.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted,#6b7280)", margin: 0 }}>No earlier versions yet. Each save creates one.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6, opacity: pending ? 0.5 : 1 }}>
              {revisions.map((r) => (
                <li key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, padding: "8px 10px", background: "var(--bone,#f4efe4)", borderRadius: 6 }}>
                  <span>
                    <span style={{ color: "var(--ink,#133024)" }}>{new Date(r.createdAt).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <span style={{ color: "var(--muted,#6b7280)" }}> · {r.sectionCount} sections{r.author ? ` · ${r.author}` : ""}</span>
                  </span>
                  <button onClick={() => restore(r.id)} style={{ border: "1px solid var(--line,#d1d5db)", background: "#fff", borderRadius: 999, padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "var(--ink,#133024)" }}>Restore</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
