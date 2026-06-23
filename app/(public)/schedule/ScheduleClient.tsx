"use client";

import { useEffect, useState } from "react";
import { getSchedule, removeFromSchedule, clearSchedule, type ScheduleItem } from "@/lib/scheduleList";
import { addToQuote } from "@/lib/quoteCart";

const T = { ink: "#133024", sage: "#1f5a3d", moss: "#3c554a", line: "rgba(19,48,36,0.14)", bone: "#f4efe4" };
const fmt = (c?: number) => (c && c > 0 ? `$${(c / 100).toFixed(2)}` : "Quote");

const ROWS: { key: keyof ScheduleItem; label: string }[] = [
  { key: "size", label: "From size" },
  { key: "priceCents", label: "From price" },
  { key: "matureSize", label: "Mature size" },
  { key: "water", label: "Water" },
  { key: "light", label: "Position" },
  { key: "growthRate", label: "Growth" },
];

export function ScheduleClient() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    setItems(getSchedule());
    setMounted(true);
    const on = () => setItems(getSchedule());
    window.addEventListener("pl-schedule-change", on);
    return () => window.removeEventListener("pl-schedule-change", on);
  }, []);

  function remove(slug: string) { removeFromSchedule(slug); setItems(getSchedule()); }

  function exportCSV() {
    const head = ["Botanical", "Common", "From size", "From price", "Mature size", "Water", "Position", "Growth"];
    const lines = items.map((i) =>
      [i.latin, i.common || "", i.size || "", fmt(i.priceCents), i.matureSize || "", i.water || "", i.light || "", i.growthRate || ""]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    const csv = ["Plant schedule — Profile Landscapes", "", head.join(","), ...lines].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "pl-plant-schedule.csv";
    a.click();
  }

  function sendAllToQuote() {
    items.forEach((i) => addToQuote({ kind: "plant", slug: i.slug, name: i.common ? `${i.common} (${i.latin})` : i.latin, size: i.size, priceCents: i.priceCents || 0, qty: 1 }));
    setFlash("Added to your quote request →");
    setTimeout(() => setFlash(""), 2500);
  }

  if (!mounted) return <p style={{ color: T.moss }}>Loading…</p>;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: T.moss }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 24, color: T.ink, marginBottom: 10 }}>Your schedule is empty</h2>
        <p style={{ marginBottom: 24 }}>Add plants with the “＋ Schedule” button as you browse the nursery or guides.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/plants" style={btn(T.ink, "#fff")}>Browse nursery</a>
          <a href="/resources" style={btn("#fff", T.ink, true)}>Plant guides</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <button onClick={sendAllToQuote} style={btn(T.ink, "#fff")}>Send all to quote · {items.length}</button>
        <button onClick={exportCSV} style={btn("#fff", T.ink, true)}>⤓ Export CSV</button>
        <button onClick={() => { clearSchedule(); setItems([]); }} style={{ ...btn("transparent", T.moss), border: "none" }}>Clear</button>
        {flash && <span style={{ alignSelf: "center", color: T.sage, fontSize: 14 }}>{flash}</span>}
      </div>

      <div style={{ overflowX: "auto", border: `1px solid ${T.line}`, borderRadius: 10 }}>
        <table style={{ borderCollapse: "collapse", minWidth: 640, width: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...cell, background: T.bone, textAlign: "left", minWidth: 130, position: "sticky", left: 0 }} />
              {items.map((i) => (
                <th key={i.slug} style={{ ...cell, background: T.bone, verticalAlign: "top", minWidth: 180 }}>
                  <div style={{ aspectRatio: "4/3", borderRadius: 6, overflow: "hidden", background: "#fff", marginBottom: 8 }}>
                    {i.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt={i.latin} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <a href={`/plants/${i.slug}`} style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 15, color: T.ink, textDecoration: "none", display: "block" }}>{i.latin}</a>
                  <div style={{ fontSize: 12, color: T.moss, margin: "2px 0 6px" }}>{i.common || ""}</div>
                  <button onClick={() => remove(i.slug)} style={{ border: "none", background: "none", color: "#9ca3af", fontSize: 12, cursor: "pointer", padding: 0 }}>Remove ✕</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.key}>
                <td style={{ ...cell, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.moss, background: "#fbf7ea", position: "sticky", left: 0 }}>{r.label}</td>
                {items.map((i) => (
                  <td key={i.slug} style={{ ...cell, fontSize: 13.5, color: T.ink }}>
                    {r.key === "priceCents" ? fmt(i.priceCents) : (i[r.key] as string) || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cell: React.CSSProperties = { padding: "12px 14px", borderBottom: `1px solid ${T.line}`, textAlign: "left", verticalAlign: "top" };
const btn = (bg: string, fg: string, border = false): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 999, background: bg, color: fg, fontSize: 14, fontWeight: 500, textDecoration: "none", border: border ? `1px solid ${T.line}` : "none", cursor: "pointer", fontFamily: "inherit" });
