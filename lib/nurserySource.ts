/**
 * Nursery price source — pulls supplier cost from the webapp price database
 * (app.profilelandscapes `/api/v1/prices`) so a website plant can be priced off a
 * real nursery cost (Andreasens / Alpine / Downes) × a resale markup, instead of a
 * manually-typed price.
 *
 * Config (set in the website env / Render):
 *   WEBAPP_API_URL   e.g. https://app.profilelandscapes.com.au   (no trailing slash)
 *   WEBAPP_API_TOKEN a SCOPED read-only per-user API token minted in the webapp
 *                    (Settings → API Access). NOT the legacy god token.
 *
 * Server-only. Never import into a client component.
 */

export type NurserySupplier = "andreasens" | "alpine" | "downes";

export const NURSERY_SUPPLIERS: { key: NurserySupplier; label: string }[] = [
  { key: "andreasens", label: "Andreasens Green" },
  { key: "alpine", label: "Alpine Nurseries" },
  { key: "downes", label: "Downes Wholesale Nursery" },
];

export type SupplierPrice = {
  botanicalName: string | null;
  description: string | null;
  size: string | null;
  unit: string | null;
  supplier: string | null;
  costCents: number; // price_ex_gst converted to cents
  priceDate: string | null;
  freshness: string | null;
};

const SUPPLIER_MATCH: Record<NurserySupplier, RegExp> = {
  andreasens: /andreasen|trademart/i, // Trademart = Andreasens' trade arm
  alpine: /alpine/i,
  downes: /downes/i,
};

function webappConfig(): { url: string; token: string } | null {
  const url = (process.env.WEBAPP_API_URL || "").replace(/\/$/, "");
  const token = process.env.WEBAPP_API_TOKEN || "";
  if (!url || !token) return null;
  return { url, token };
}

/** True when the integration is configured (URL + token present). */
export function nurserySourceConfigured(): boolean {
  return webappConfig() !== null;
}

/**
 * Look up the current supplier cost for a plant. Searches the webapp price DB by
 * botanical name (+ optional size), then picks the freshest matching line for the
 * requested supplier. Returns null if not configured or no match.
 */
export async function fetchSupplierPrice(opts: {
  botanical: string;
  size?: string | null;
  supplier: NurserySupplier;
}): Promise<SupplierPrice | null> {
  const cfg = webappConfig();
  if (!cfg || !opts.botanical?.trim()) return null;

  const params = new URLSearchParams({ q: opts.botanical.trim(), cat: "plants" });
  if (opts.size?.trim()) params.set("size", opts.size.trim());

  let data: { ok?: boolean; prices?: RawPrice[] };
  try {
    const res = await fetch(`${cfg.url}/api/v1/prices?${params.toString()}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }
  if (!data?.ok || !Array.isArray(data.prices)) return null;

  const rx = SUPPLIER_MATCH[opts.supplier];
  const wantSize = (opts.size || "").trim().toLowerCase();
  const matches = data.prices
    .filter((p) => rx.test(p.supplier || "") && typeof p.price_ex_gst === "number")
    // prefer an exact size match when a size was requested
    .sort((a, b) => {
      if (wantSize) {
        const ea = (a.size || "").toLowerCase() === wantSize ? 0 : 1;
        const eb = (b.size || "").toLowerCase() === wantSize ? 0 : 1;
        if (ea !== eb) return ea - eb;
      }
      return (b.price_date || "").localeCompare(a.price_date || ""); // freshest first
    });

  const best = matches[0];
  if (!best || typeof best.price_ex_gst !== "number") return null;

  return {
    botanicalName: best.botanical_name ?? null,
    description: best.description ?? null,
    size: best.size ?? null,
    unit: best.unit ?? null,
    supplier: best.supplier ?? null,
    costCents: Math.round(best.price_ex_gst * 100),
    priceDate: best.price_date ?? null,
    freshness: best.freshness ?? null,
  };
}

/** Retail price (cents) from a supplier cost + markup %, GST-inclusive display left to the caller. */
export function applyMarkup(costCents: number, markupPct: number): number {
  return Math.round(costCents * (1 + (markupPct || 0) / 100));
}

type RawPrice = {
  botanical_name: string | null;
  description: string | null;
  size: string | null;
  unit: string | null;
  supplier: string | null;
  price_ex_gst: number | null;
  category: string | null;
  price_date: string | null;
  freshness: string | null;
};
