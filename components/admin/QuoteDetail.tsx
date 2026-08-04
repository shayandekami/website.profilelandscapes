"use client";

import { useState, useTransition } from "react";
import type { SaveResult } from "@/app/admin/(chrome)/quotes/actions";

type Quote = {
  id: number;
  referenceCode: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  sector: string;
  budget: string;
  siteAddress: string;
  postcode: string;
  projectStage: string;
  services: string[];
  desiredStart: string;
  tenderDue: string;
  contactPreference: string;
  architect: string;
  brief: string;
  attachments: Array<{ id: number; filename: string; mimeType: string; sizeBytes: number }>;
  status: "new" | "in_reply" | "site_visit" | "won" | "lost" | "out_of_scope";
  notes: string;
  receivedAt: string;
};

const STATUS_LABELS: Record<Quote["status"], string> = {
  new: "New",
  in_reply: "In reply",
  site_visit: "Site visit",
  won: "Won",
  lost: "Lost",
  out_of_scope: "Out of scope",
};

export function QuoteDetail({
  quote: initial,
  save,
}: {
  quote: Quote;
  save: (input: unknown) => Promise<SaveResult>;
}) {
  const [q, setQ] = useState(initial);
  const [msg, setMsg] = useState<{ text: string; kind: "idle" | "ok" | "err" | "saving" }>({
    text: "",
    kind: "idle",
  });
  const [pending, startTransition] = useTransition();

  function doSave(status?: Quote["status"]) {
    setMsg({ text: "Saving…", kind: "saving" });
    const next = status || q.status;
    startTransition(async () => {
      const r = await save({ id: q.id, status: next, notes: q.notes });
      if (r.ok) {
        if (status) setQ((p) => ({ ...p, status }));
        setMsg({ text: "Saved", kind: "ok" });
      } else {
        setMsg({ text: r.error, kind: "err" });
      }
    });
  }

  const mailtoBody = encodeURIComponent(
    `Hi ${q.name.split(" ")[0]},\n\nThanks for getting in touch about your project. We are reviewing the information supplied under reference ${q.referenceCode}.\n\n— Carlo`
  );
  const mailto = `mailto:${q.email}?subject=${encodeURIComponent(`Re: ${q.referenceCode} — your Profile Landscapes enquiry`)}&body=${mailtoBody}`;
  const formatSize = (bytes: number) => bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return (
    <>
      <div className="page-head-a">
        <div>
          <div className="sub" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--subtle)" }}>
            — {q.referenceCode} · received {new Date(q.receivedAt).toLocaleString("en-AU")}
          </div>
          <h1>
            {q.name}
            {q.company && <span className="it"> · {q.company}</span>}
          </h1>
          <div className="sub">
            <a href={`mailto:${q.email}`} style={{ color: "var(--accent)" }}>{q.email}</a>
            {q.phone && ` · ${q.phone}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn" href="/admin/quotes">← Inbox</a>
          <a className="btn pri" href={mailto}>Reply by email →</a>
        </div>
      </div>

      {msg.kind !== "idle" && (
        <div style={{
          padding: "8px 14px", borderRadius: 4, marginBottom: 16, fontSize: 13.5,
          background: msg.kind === "err" ? "#fdf3eb" : msg.kind === "ok" ? "#e8f0eb" : "#faf8f0",
          color: msg.kind === "err" ? "var(--danger)" : msg.kind === "ok" ? "var(--sage)" : "var(--ink-2)",
          border: "1px solid", borderColor: msg.kind === "err" ? "#ecc7a5" : msg.kind === "ok" ? "#c5dac9" : "var(--line)",
        }}>{msg.text}</div>
      )}

      <div className="detail-split">
        <div className="dtl-card">
          <h4>Brief</h4>
          <div className="dtl-sub">FROM THE ENQUIRY</div>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, fontSize: 14, marginTop: 12 }}>
            <span style={{ color: "var(--muted)" }}>Sector</span><span>{q.sector || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Budget</span><span>{q.budget || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Site</span><span>{q.siteAddress ? `${q.siteAddress} ${q.postcode}` : "—"}</span>
            <span style={{ color: "var(--muted)" }}>Stage</span><span>{q.projectStage || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Services</span><span>{q.services.join(", ") || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Preferred start</span><span>{q.desiredStart || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Tender due</span><span>{q.tenderDue ? new Date(q.tenderDue).toLocaleDateString("en-AU") : "—"}</span>
            <span style={{ color: "var(--muted)" }}>Architect</span><span>{q.architect || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Contact by</span><span>{q.contactPreference || "—"}</span>
          </div>
          <div style={{ marginTop: 18, padding: 14, background: "#faf8f0", borderRadius: 6, whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.55 }}>
            {q.brief}
          </div>
          {q.attachments.length > 0 && <div style={{ marginTop: 18 }}><h4>Project documents</h4>{q.attachments.map((file) => <a key={file.id} href={`/api/admin/quotes/${q.id}/attachments/${file.id}`} className="quote-admin-file"><span>{file.filename}</span><small>{formatSize(file.sizeBytes)} · Download</small></a>)}</div>}
        </div>

        <div className="dtl-card">
          <h4>Status &amp; notes</h4>
          <div className="dtl-sub">INTERNAL — NOT VISIBLE TO THE ENQUIRER</div>

          <div className="ed-field">
            <label>— Status</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {(Object.keys(STATUS_LABELS) as Quote["status"][]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => doSave(s)}
                  disabled={pending}
                  className={`btn-sm ${q.status === s ? "pri" : ""}`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="ed-field">
            <label>— Notes</label>
            <textarea
              value={q.notes}
              onChange={(e) => setQ((p) => ({ ...p, notes: e.target.value }))}
              rows={8}
              placeholder="Site visit notes, scope clarifications, internal context…"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn pub" type="button" onClick={() => doSave()} disabled={pending}>
              Save notes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
