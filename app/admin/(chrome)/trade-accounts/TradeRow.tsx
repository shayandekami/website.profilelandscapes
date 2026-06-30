"use client";

import { useState, useTransition } from "react";
import { updateTradeAccount } from "./actions";

type Acct = {
  id: number; email: string; company: string | null; contactName: string | null;
  phone: string | null; status: string; priceTier: string; createdAt: Date;
};

export function TradeRow({ a }: { a: Acct }) {
  const [status, setStatus] = useState(a.status);
  const [tier, setTier] = useState(a.priceTier);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function save(next: { status?: string; priceTier?: string }) {
    start(async () => {
      await updateTradeAccount({ id: a.id, ...next });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <tr style={{ borderTop: "1px solid var(--line,#eee)", opacity: pending ? 0.6 : 1 }}>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ fontWeight: 600 }}>{a.company || "—"}</div>
        <div style={{ fontSize: 13, color: "var(--muted,#6b7280)" }}>{a.contactName || ""}</div>
      </td>
      <td style={{ padding: "12px 14px", fontSize: 13.5 }}>
        <div>{a.email}</div>
        <div style={{ color: "var(--muted,#6b7280)" }}>{a.phone || ""}</div>
      </td>
      <td style={{ padding: "12px 14px" }}>
        <select value={status} onChange={(e) => { setStatus(e.target.value); save({ status: e.target.value }); }} style={sel}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
        </select>
      </td>
      <td style={{ padding: "12px 14px" }}>
        <select value={tier} onChange={(e) => { setTier(e.target.value); save({ priceTier: e.target.value }); }} style={sel}>
          <option value="retail">Retail (0%)</option>
          <option value="trade">Trade (−15%)</option>
          <option value="contract">Contract (−25%)</option>
        </select>
      </td>
      <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--muted,#6b7280)", whiteSpace: "nowrap" }}>
        {new Date(a.createdAt).toLocaleDateString("en-AU")}{saved && <span style={{ color: "var(--accent,#1f5a3d)", marginLeft: 8 }}>✓</span>}
      </td>
    </tr>
  );
}

const sel: React.CSSProperties = { padding: "6px 10px", border: "1px solid var(--line,#d1d5db)", borderRadius: 6, fontSize: 13, fontFamily: "inherit", background: "#fff" };
