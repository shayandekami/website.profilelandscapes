"use client";

/**
 * Client-side trade pricing — reads the readable `pl_trade_tier` cookie (set at
 * login) to show discounted prices and a "trade pricing" indicator. This is
 * DISPLAY ONLY; the server (checkout/validate APIs) re-applies the tier from the
 * httpOnly session and is authoritative on what's actually charged.
 */

export type Tier = "retail" | "trade" | "contract";

export function getTier(): Tier {
  if (typeof document === "undefined") return "retail";
  const m = document.cookie.match(/(?:^|;\s*)pl_trade_tier=([^;]+)/);
  const v = m?.[1];
  return v === "trade" || v === "contract" ? v : "retail";
}

export function tierMultiplier(tier: Tier): number {
  return tier === "contract" ? 0.75 : tier === "trade" ? 0.85 : 1;
}

export function tierDiscountPct(tier: Tier): number {
  return Math.round((1 - tierMultiplier(tier)) * 100);
}

/** Apply the active tier discount to a list price (cents). */
export function applyTier(cents: number, tier: Tier = getTier()): number {
  return Math.round(cents * tierMultiplier(tier));
}
