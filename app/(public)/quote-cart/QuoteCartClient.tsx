"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuote, setQuoteQty, removeFromQuote, clearQuote, type QuoteItem } from "@/lib/quoteCart";

const T = { ink: "#133024", sage: "#1f5a3d", moss: "#3c554a", line: "rgba(19,48,36,0.14)", bone: "#f4efe4" };

function fmt(c?: number) {
  return c && c > 0 ? `$${(c / 100).toFixed(2)}` : "Quote";
}

export function QuoteCartClient() {
  const router = useRouter();
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", notes: "" });

  useEffect(() => {
    setItems(getQuote());
    setMounted(true);
    const onChange = () => setItems(getQuote());
    window.addEventListener("pl-quote-change", onChange);
    return () => window.removeEventListener("pl-quote-change", onChange);
  }, []);

  function changeQty(it: QuoteItem, delta: number) {
    setQuoteQty(it.slug, it.size, it.qty + delta);
    setItems(getQuote());
  }
  function remove(it: QuoteItem) {
    removeFromQuote(it.slug, it.size);
    setItems(getQuote());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (items.length === 0) { setError("Your quote request is empty."); return; }
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    setSubmitting(true);

    const lines = items
      .map((i) => `• ${i.qty} × ${i.name}${i.size ? ` (${i.size})` : ""}${i.priceCents ? ` — indicative ${fmt(i.priceCents)} ea` : " — quote required"}`)
      .join("\n");
    const brief =
      `TRADE / BULK QUOTE REQUEST — ${items.length} line(s)\n\n${lines}\n\n` +
      (form.notes.trim() ? `Notes: ${form.notes.trim()}\n\n` : "") +
      `Submitted via the nursery quote cart.`;

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          sector: "Trade — nursery",
          budget: "",
          brief,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Could not submit. Please try again.");
      }
      clearQuote();
      router.push("/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (!mounted) return <p style={{ color: T.moss }}>Loading…</p>;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: T.moss }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 24, color: T.ink, marginBottom: 10 }}>
          No items in your quote yet
        </h2>
        <p style={{ marginBottom: 24 }}>Browse the nursery or the trade pricelist and add the lines you need.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/plants/pricelist" style={btnPrimary}>Trade pricelist →</a>
          <a href="/plants" style={btnGhost}>Browse nursery</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 36, alignItems: "start" }}>
      {/* Items */}
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.line}` }}>
              <th style={th}>Item</th>
              <th style={{ ...th, textAlign: "center" }}>Qty</th>
              <th style={{ ...th, textAlign: "right" }}>Indic. rate</th>
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={`${it.slug}-${it.size}`} style={{ borderBottom: `1px solid ${T.line}` }}>
                <td style={{ padding: "14px 0" }}>
                  <a href={`/plants/${it.slug}`} style={{ fontWeight: 500, fontSize: 14.5, color: T.ink, textDecoration: "none", fontStyle: "italic", fontFamily: "'Fraunces', serif" }}>
                    {it.name}
                  </a>
                  {it.size && <div style={{ fontSize: 12, color: T.moss, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{it.size}</div>}
                </td>
                <td style={{ padding: "14px 0", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${T.line}`, borderRadius: 6 }}>
                    <button onClick={() => changeQty(it, -1)} style={qtyBtn}>−</button>
                    <span style={{ minWidth: 28, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{it.qty}</span>
                    <button onClick={() => changeQty(it, 1)} style={qtyBtn}>+</button>
                  </div>
                </td>
                <td style={{ padding: "14px 0", textAlign: "right", fontSize: 14, color: it.priceCents ? T.ink : "#c2783a", fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmt(it.priceCents)}
                </td>
                <td style={{ padding: "14px 0 14px 12px", textAlign: "right" }}>
                  <button onClick={() => remove(it)} aria-label="Remove" style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18 }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 18, display: "flex", gap: 16 }}>
          <a href="/plants/pricelist" style={{ color: T.sage, fontSize: 14, textDecoration: "none" }}>← Add more from pricelist</a>
          <button onClick={() => { clearQuote(); setItems([]); }} style={{ border: "none", background: "none", color: T.moss, fontSize: 14, cursor: "pointer" }}>Clear all</button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} style={{ background: T.bone, borderRadius: 8, padding: "26px 24px", position: "sticky", top: 80 }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 21, color: T.ink, margin: "0 0 16px" }}>Your details</h2>
        {error && <div style={{ background: "#fdecec", border: "1px solid #f3c0c0", color: "#a3392d", padding: "10px 12px", borderRadius: 6, fontSize: 13.5, marginBottom: 14 }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input required placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={input} />
          <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={input} />
          <input required type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={input} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={input} />
          <textarea placeholder="Notes — site, timing, delivery suburb…" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...input, resize: "vertical" }} />
        </div>
        <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: "100%", marginTop: 16, justifyContent: "center", opacity: submitting ? 0.6 : 1 }}>
          {submitting ? "Sending…" : `Request quote · ${items.length} line${items.length === 1 ? "" : "s"}`}
        </button>
        <p style={{ fontSize: 12, color: T.moss, textAlign: "center", margin: "12px 0 0" }}>
          We reply with rates &amp; availability within two business days.
        </p>
      </form>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "0 0 12px", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" };
const qtyBtn: React.CSSProperties = { width: 30, height: 36, background: "transparent", border: "none", fontSize: 16, cursor: "pointer", color: T.ink };
const input: React.CSSProperties = { width: "100%", padding: "11px 14px", border: "1px solid rgba(19,48,36,0.18)", borderRadius: 7, fontSize: 14.5, fontFamily: "inherit", color: T.ink, background: "#fff", boxSizing: "border-box", outline: "none" };
const btnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 999, background: T.ink, color: "#fff", fontSize: 14.5, fontWeight: 500, textDecoration: "none", border: "none", cursor: "pointer", fontFamily: "inherit" };
const btnGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 999, background: "#fff", color: T.ink, fontSize: 14.5, fontWeight: 500, textDecoration: "none", border: `1px solid ${T.line}`, cursor: "pointer", fontFamily: "inherit" };
