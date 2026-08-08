"use client";

import { useState, useTransition } from "react";
import { refreshPlantPrice } from "@/app/admin/(chrome)/nursery/actions";

/**
 * Pulls the current supplier cost for this plant from the webapp price database
 * and rewrites the sell price as cost × markup. type="button" so it never submits
 * the surrounding edit form.
 */
export function RefreshPriceButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function onClick() {
    setMsg(null);
    start(async () => {
      try {
        const res = await refreshPlantPrice(id);
        if (res.ok) {
          setMsg({
            ok: true,
            text: `Updated — cost $${((res.costCents ?? 0) / 100).toFixed(2)} → sell $${((res.priceCents ?? 0) / 100).toFixed(2)}. Reload to see the new price in the field.`,
          });
        } else {
          setMsg({ ok: false, text: res.error || "Could not refresh." });
        }
      } catch {
        setMsg({ ok: false, text: "Could not reach the price database." });
      }
    });
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        style={{
          padding: "7px 14px",
          borderRadius: 8,
          border: "1px solid var(--line-2, #dcd4bf)",
          background: pending ? "#f3f4f6" : "#fff",
          fontSize: 13,
          fontWeight: 500,
          cursor: pending ? "default" : "pointer",
        }}
      >
        {pending ? "Refreshing…" : "↻ Refresh from supplier"}
      </button>
      {msg && (
        <span style={{ fontSize: 12.5, color: msg.ok ? "#0f7a3d" : "#c01717" }}>{msg.text}</span>
      )}
    </span>
  );
}
