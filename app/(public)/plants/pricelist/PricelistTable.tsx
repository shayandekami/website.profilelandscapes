"use client";

import { useEffect, useMemo, useState } from "react";
import { addToCart } from "@/lib/buyCart";
import { addToQuote } from "@/lib/quoteCart";
import { stockStatus, STOCK_COLORS } from "@/lib/stock";
import { getTier, applyTier, tierDiscountPct, type Tier } from "@/lib/tradePricing";

type Variant = { size: string; priceCents: number };
type Row = {
  id: number;
  slug: string;
  latinName: string;
  commonName: string | null;
  family: string | null;
  priceCents: number;
  size: string | null;
  variants: Variant[];
  stockQty: number;
  tags: string[];
};

const T = { ink: "#133024", sage: "#1f5a3d", moss: "#3c554a", ochre: "#c2783a", line: "rgba(19,48,36,0.12)", bone: "#f4efe4" };
const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;
const TAGS = ["NATIVE", "GRASS", "DROUGHT", "SCREEN", "HEDGE", "FRAGRANT", "SHADE", "COASTAL", "FEATURE"];

export function PricelistTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [advancedOnly, setAdvancedOnly] = useState(false);
  const [sort, setSort] = useState<"name" | "price-asc" | "price-desc">("name");
  const [flash, setFlash] = useState<string>("");
  const [tier, setTier] = useState<Tier>("retail");
  useEffect(() => setTier(getTier()), []);
  const tp = (cents: number) => applyTier(cents, tier);

  // Advanced/specimen stock = offered in a large container (≥100L or ≥400mm)
  const isAdvanced = (r: Row) =>
    (r.variants || []).some((v) => {
      const m = /(\d+)(mm|L)/.exec(v.size);
      if (!m) return false;
      const n = parseInt(m[1]);
      return m[2] === "L" ? n >= 100 : n >= 400;
    });

  const filtered = useMemo(() => {
    let r = rows.filter((x) => {
      if (inStockOnly && x.stockQty <= 0) return false;
      if (advancedOnly && !isAdvanced(x)) return false;
      if (tag && !(x.tags || []).includes(tag)) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          x.latinName.toLowerCase().includes(s) ||
          (x.commonName || "").toLowerCase().includes(s) ||
          (x.family || "").toLowerCase().includes(s)
        );
      }
      return true;
    });
    r = [...r].sort((a, b) => {
      if (sort === "price-asc") return a.priceCents - b.priceCents;
      if (sort === "price-desc") return b.priceCents - a.priceCents;
      return a.latinName.localeCompare(b.latinName);
    });
    return r;
  }, [rows, q, tag, inStockOnly, advancedOnly, sort]);

  function flashMsg(m: string) {
    setFlash(m);
    setTimeout(() => setFlash(""), 1600);
  }

  function downloadCSV() {
    const head = ["Botanical name", "Common name", "Family", "Sizes & rates", "Availability"];
    const lines = filtered.map((r) => {
      const vs = (r.variants?.length ? r.variants : [{ size: r.size || "pot", priceCents: r.priceCents }])
        .map((v) => `${v.size} ${fmt(v.priceCents)}`)
        .join("; ");
      const cells = [r.latinName, r.commonName || "", r.family || "", vs, stockStatus(r.stockQty).label];
      return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
    });
    const stamp = new Date().toISOString().slice(0, 10);
    const csv = [`Profile Landscapes Nursery — availability list (current as of ${stamp})`, "", head.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pl-nursery-availability-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stampDate = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14, position: "sticky", top: 54, background: "#faf6eb", paddingTop: 8, paddingBottom: 8, zIndex: 5 }}>
        <input
          type="search"
          placeholder="Search botanical, common or family name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: "1 1 280px", border: `1px solid ${T.line}`, background: "#fff", padding: "10px 16px", borderRadius: 999, fontSize: 14, fontFamily: "inherit", color: T.ink, outline: "none" }}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} style={{ border: `1px solid ${T.line}`, background: "#fff", padding: "9px 12px", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit" }}>
          <option value="name">Sort: A–Z</option>
          <option value="price-asc">Price low → high</option>
          <option value="price-desc">Price high → low</option>
        </select>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: T.moss, cursor: "pointer" }}>
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
          In stock only
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: T.moss, cursor: "pointer" }}>
          <input type="checkbox" checked={advancedOnly} onChange={(e) => setAdvancedOnly(e.target.checked)} />
          Advanced trees
        </label>
      </div>

      {/* Tag chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setTag(null)} style={chip(!tag)}>All</button>
        {TAGS.map((t) => {
          const n = rows.filter((r) => (r.tags || []).includes(t)).length;
          if (!n) return null;
          return <button key={t} onClick={() => setTag(tag === t ? null : t)} style={chip(tag === t)}>{t[0] + t.slice(1).toLowerCase()} ({n})</button>;
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5d7363", letterSpacing: "0.1em" }}>
          {filtered.length} lines · current as of {stampDate}
          {flash && <span style={{ color: T.sage, marginLeft: 14 }}>{flash}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={downloadCSV} style={{ ...btnSm("transparent"), color: T.ink, border: `1px solid ${T.line}` }} title="Download this list as a spreadsheet">
            ⤓ Download CSV
          </button>
          <button onClick={() => window.print()} style={{ ...btnSm("transparent"), color: T.ink, border: `1px solid ${T.line}` }} title="Print or save as PDF">
            ⎙ Print / PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", border: `1px solid ${T.line}`, borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 820 }}>
          <thead>
            <tr style={{ background: T.bone, textAlign: "left" }}>
              <th style={th}>Botanical name</th>
              <th style={th}>Common</th>
              <th style={th}>Sizes &amp; rates</th>
              <th style={{ ...th, textAlign: "center" }}>Stock</th>
              <th style={{ ...th, textAlign: "right", width: 220 }}>Add</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const inStock = r.stockQty > 0;
              const vs = r.variants?.length ? r.variants : [{ size: r.size || "pot", priceCents: r.priceCents }];
              return (
                <tr key={r.id} style={{ borderTop: `1px solid ${T.line}` }}>
                  <td style={{ ...td, fontFamily: "'Fraunces', serif", fontStyle: "italic", color: T.ink }}>
                    <a href={`/plants/${r.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{r.latinName}</a>
                  </td>
                  <td style={{ ...td, color: T.moss }}>{r.commonName || "—"}</td>
                  <td style={td}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                      {vs.slice(0, 6).map((v, i) => (
                        <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: T.moss, whiteSpace: "nowrap" }}>
                          {v.size} <b style={{ color: tier !== "retail" ? T.sage : T.ink }}>{fmt(tp(v.priceCents))}</b>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    {(() => {
                      const s = stockStatus(r.stockQty); const sc = STOCK_COLORS[s.tone];
                      return (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: sc.fg, background: sc.bg, padding: "3px 9px", borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                          {s.short}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                    {inStock && (
                      <button
                        onClick={() => { addToCart({ type: "plant", id: r.id, name: r.commonName ? `${r.commonName} (${r.latinName})` : r.latinName, priceCents: tp(r.priceCents), quantity: 1 }); flashMsg(`Added ${r.latinName} to cart`); }}
                        style={btnSm(T.ink)}
                      >
                        + Cart
                      </button>
                    )}
                    <button
                      onClick={() => { addToQuote({ kind: "plant", slug: r.slug, name: r.commonName ? `${r.commonName} (${r.latinName})` : r.latinName, size: vs[0].size, priceCents: inStock ? tp(r.priceCents) : 0, qty: 1 }); flashMsg(`Added ${r.latinName} to quote`); }}
                      style={{ ...btnSm("transparent"), color: T.ink, border: `1px solid ${T.line}`, marginLeft: 6 }}
                    >
                      + Quote
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: T.moss }}>No lines match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 14px", fontSize: 10.5, fontWeight: 600, color: "#5d7363", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" };
const td: React.CSSProperties = { padding: "11px 14px", verticalAlign: "top" };
const chip = (on: boolean): React.CSSProperties => ({ padding: "6px 12px", border: `1px solid ${on ? T.ink : T.line}`, background: on ? T.ink : "#fff", color: on ? "#fff" : T.ink, borderRadius: 999, fontSize: 12, cursor: "pointer", fontFamily: "inherit" });
const btnSm = (bg: string): React.CSSProperties => ({ padding: "7px 13px", borderRadius: 999, background: bg, color: "#fff", border: "none", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" });
