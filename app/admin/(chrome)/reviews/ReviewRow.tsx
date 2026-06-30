"use client";

import { useTransition } from "react";
import { moderateReview } from "./actions";

type Review = { id: number; plantSlug: string; author: string; rating: number; body: string | null; approved: boolean; createdAt: Date };

export function ReviewRow({ r }: { r: Review }) {
  const [pending, start] = useTransition();
  const act = (action: "approve" | "reject" | "delete") => start(async () => { await moderateReview({ id: r.id, action }); });

  return (
    <tr style={{ borderTop: "1px solid var(--line,#eee)", opacity: pending ? 0.5 : 1 }}>
      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
        <span style={{ color: "var(--accent,#c2783a)" }}>{"★".repeat(r.rating)}</span>
      </td>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.author}</div>
        <a href={`/plants/${r.plantSlug}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--accent,#1f5a3d)" }}>{r.plantSlug}</a>
      </td>
      <td style={{ padding: "12px 14px", fontSize: 13.5, color: "var(--muted,#374151)", maxWidth: 420 }}>{r.body || <em style={{ color: "#9ca3af" }}>(no comment)</em>}</td>
      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 11.5, padding: "3px 8px", borderRadius: 999, background: r.approved ? "rgba(31,90,61,0.12)" : "rgba(194,120,58,0.14)", color: r.approved ? "#1f5a3d" : "#9a5a22" }}>
          {r.approved ? "Approved" : "Pending"}
        </span>
      </td>
      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
        {!r.approved && <button onClick={() => act("approve")} style={btn("#133024", "#fff")}>Approve</button>}
        <button onClick={() => act(r.approved ? "delete" : "reject")} style={{ ...btn("transparent", "#a3392d"), border: "1px solid #e7c3bd", marginLeft: 6 }}>
          {r.approved ? "Remove" : "Reject"}
        </button>
      </td>
    </tr>
  );
}

const btn = (bg: string, fg: string): React.CSSProperties => ({ padding: "6px 13px", borderRadius: 999, background: bg, color: fg, border: "none", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" });
