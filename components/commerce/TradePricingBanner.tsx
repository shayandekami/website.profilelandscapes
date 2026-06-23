"use client";

import { useEffect, useState } from "react";
import { getTier, tierDiscountPct } from "@/lib/tradePricing";

/** Thin top banner shown when a trade account is logged in. */
export function TradePricingBanner() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t = getTier();
    setPct(tierDiscountPct(t));
  }, []);

  if (pct <= 0) return null;

  return (
    <div
      style={{
        background: "var(--accent, #1f5a3d)",
        color: "#fff",
        fontFamily: "var(--sans, 'Inter Tight', sans-serif)",
        fontSize: 13,
        textAlign: "center",
        padding: "7px 16px",
        letterSpacing: "0.01em",
      }}
    >
      Trade pricing active — {pct}% off list applied.{" "}
      <a href="/trade/account" style={{ color: "#e8dcb6", textDecoration: "underline", textUnderlineOffset: 2 }}>
        Your account
      </a>
    </div>
  );
}
