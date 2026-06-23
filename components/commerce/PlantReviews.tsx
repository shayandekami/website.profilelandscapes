"use client";

import { useEffect, useState } from "react";

const T = { ink: "#133024", sage: "#1f5a3d", moss: "#3c554a", ochre: "#c2783a", line: "rgba(19,48,36,0.12)", paper: "#faf6eb" };

type Review = { author: string; rating: number; body: string | null; createdAt: string };

function Stars({ n, size = 15 }: { n: number; size?: number }) {
  return <span style={{ color: T.ochre, fontSize: size, letterSpacing: 1 }}>{"★".repeat(Math.round(n))}{"☆".repeat(Math.max(0, 5 - Math.round(n)))}</span>;
}

export function PlantReviews({ slug }: { slug: string }) {
  const [data, setData] = useState<{ avg: number; count: number; reviews: Review[] }>({ avg: 0, count: 0, reviews: [] });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ author: "", rating: 5, body: "", website: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/plants/${slug}/review`).then((r) => r.json()).then(setData).catch(() => {});
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    try {
      const res = await fetch(`/api/plants/${slug}/review`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating: Number(form.rating) }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Could not submit.");
      setMsg("Thanks — your review is awaiting moderation.");
      setForm({ author: "", rating: 5, body: "", website: "" });
      setOpen(false);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not submit.");
    } finally { setBusy(false); }
  }

  const input: React.CSSProperties = { width: "100%", padding: "10px 13px", border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 14, fontFamily: "inherit", background: "#fff", boxSizing: "border-box" };

  return (
    <section style={{ maxWidth: 1400, margin: "60px auto", padding: "0 56px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontSize: 32, letterSpacing: "-0.02em", margin: 0, color: T.ink }}>
          Grower &amp; gardener <span style={{ fontStyle: "italic", color: T.sage }}>reviews.</span>
        </h2>
        <button onClick={() => setOpen((o) => !o)} style={{ padding: "10px 20px", borderRadius: 999, background: T.ink, color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          {open ? "Close" : "Write a review"}
        </button>
      </div>

      {data.count > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Stars n={data.avg} size={20} />
          <span style={{ fontSize: 15, color: T.ink, fontWeight: 500 }}>{data.avg.toFixed(1)}</span>
          <span style={{ fontSize: 14, color: T.moss }}>· {data.count} review{data.count === 1 ? "" : "s"}</span>
        </div>
      ) : (
        <p style={{ fontSize: 14.5, color: T.moss, marginBottom: 20 }}>No reviews yet — be the first to share how this plant performed for you.</p>
      )}

      {msg && <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: T.sage, marginBottom: 16 }}>{msg}</div>}

      {open && (
        <form onSubmit={submit} style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, padding: "22px 24px", maxWidth: 560, marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 12 }}>
            <input required placeholder="Your name" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} style={input} />
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} style={{ ...input, width: "auto" }}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </div>
          <textarea placeholder="How did it perform? Position, soil, growth…" rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} style={{ ...input, resize: "vertical" }} />
          <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999, width: 1, height: 1 }} aria-hidden="true" />
          <button type="submit" disabled={busy} style={{ marginTop: 12, padding: "11px 22px", borderRadius: 999, background: T.ink, color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", opacity: busy ? 0.6 : 1 }}>
            {busy ? "Submitting…" : "Submit review"}
          </button>
        </form>
      )}

      {data.reviews.length > 0 && (
        <div style={{ display: "grid", gap: 16, maxWidth: 760 }}>
          {data.reviews.map((r, i) => (
            <div key={i} style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Stars n={r.rating} />
                <span style={{ fontSize: 14, fontWeight: 500, color: T.ink }}>{r.author}</span>
                <span style={{ fontSize: 12.5, color: T.moss }}>· {new Date(r.createdAt).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}</span>
              </div>
              {r.body && <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.moss }}>{r.body}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
