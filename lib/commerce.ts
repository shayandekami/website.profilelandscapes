/**
 * Commerce utility helpers — shared across shop, nursery, quote tracker.
 */

/** Format cents as a currency string: 7800 → "$78.00" */
export function formatPrice(cents: number, currency = "AUD"): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Format cents compactly: 7800 → "$78" (no decimals if whole dollar) */
export function formatPriceShort(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars.toFixed(0)}`
    : `$${dollars.toFixed(2)}`;
}

/** Parse dollars string to cents: "78.50" → 7850 */
export function parseDollarsToCents(dollars: string | number): number {
  return Math.round(Number(dollars) * 100);
}

/** Generate a unique order number: ORD-2024-0001 */
export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(sequence).padStart(4, "0")}`;
}

/** Generate a quote reference code: Q-2024-0001 */
export function generateQuoteRef(sequence: number): string {
  const year = new Date().getFullYear();
  return `Q-${year}-${String(sequence).padStart(4, "0")}`;
}

/** Slugify a string: "Mat Rush" → "mat-rush" */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Calculate cart subtotal from line items. Items have priceCents + quantity. */
export function cartSubtotal(
  items: Array<{ priceCents: number; quantity: number }>
): number {
  return items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
}

/** Flat $10 shipping under $200; free over $200. */
export function calcShipping(subtotalCents: number): number {
  return subtotalCents >= 20000 ? 0 : 1000; // $10 or free
}
