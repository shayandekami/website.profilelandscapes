"use client";

/**
 * Quote cart — a second, separate cart for *quote requests* (trade buyers, bulk
 * orders, or out-of-stock lines that need a price). Independent of the buy cart
 * (`pl_cart`); stored under `pl_quote`. Submitting it posts to /api/quote.
 */

export type QuoteItem = {
  kind: "plant" | "product";
  slug: string;
  name: string;
  size?: string;
  /** indicative unit price in cents, if known (0 = quote required) */
  priceCents?: number;
  qty: number;
};

const KEY = "pl_quote";

export function getQuote(): QuoteItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveQuote(items: QuoteItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  const total = items.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll("[data-quote-count]").forEach((el) => {
    el.textContent = String(total);
    (el as HTMLElement).style.display = total > 0 ? "" : "none";
  });
  window.dispatchEvent(new CustomEvent("pl-quote-change", { detail: { total } }));
}

export function quoteCount(): number {
  return getQuote().reduce((s, i) => s + i.qty, 0);
}

export function addToQuote(item: QuoteItem) {
  const items = getQuote();
  const existing = items.find((i) => i.kind === item.kind && i.slug === item.slug && i.size === item.size);
  if (existing) existing.qty += item.qty;
  else items.push(item);
  saveQuote(items);
}

export function removeFromQuote(slug: string, size?: string) {
  saveQuote(getQuote().filter((i) => !(i.slug === slug && i.size === size)));
}

export function setQuoteQty(slug: string, size: string | undefined, qty: number) {
  const items = getQuote()
    .map((i) => (i.slug === slug && i.size === size ? { ...i, qty: Math.max(0, qty) } : i))
    .filter((i) => i.qty > 0);
  saveQuote(items);
}

export function clearQuote() {
  saveQuote([]);
}
