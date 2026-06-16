/**
 * Stock-status tiers — the AU nursery-trade convention (Available now / Limited /
 * Grown to order). Derived from stockQty so cards, PDP and the pricelist all read
 * consistently. Pure function — safe in server or client components.
 */

export type StockTone = "available" | "limited" | "preorder";
export type StockStatus = { label: string; short: string; tone: StockTone };

export function stockStatus(qty: number | null | undefined): StockStatus {
  const n = qty ?? 0;
  if (n >= 30) return { label: "Available now", short: "In stock", tone: "available" };
  if (n >= 1) return { label: "Limited stock", short: "Limited", tone: "limited" };
  return { label: "Grown to order", short: "Pre-order", tone: "preorder" };
}

export const STOCK_COLORS: Record<StockTone, { bg: string; fg: string; dot: string }> = {
  available: { bg: "rgba(31,90,61,0.1)", fg: "#1f5a3d", dot: "#1f5a3d" },
  limited: { bg: "rgba(194,120,58,0.12)", fg: "#9a5a22", dot: "#c2783a" },
  preorder: { bg: "rgba(19,48,36,0.08)", fg: "#3c554a", dot: "#8a9489" },
};
