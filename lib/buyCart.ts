"use client";

/**
 * Buy cart — the purchase cart used by the shop, nursery and /cart + Stripe
 * checkout. Stored under `pl_cart` as a CartItem[] (the format /cart and the
 * checkout/validate APIs expect). Use these helpers everywhere so the format
 * stays consistent (a prior bug stored an {id:qty} object that /cart couldn't read).
 */

export type CartItem = {
  type: "product" | "plant";
  id: number;
  name: string;
  image?: string;
  priceCents: number;
  quantity: number;
};

const KEY = "pl_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : []; // tolerate the legacy {id:qty} object
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  const total = items.reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll("#cart-count, [data-cart-count]").forEach((el) => {
    el.textContent = String(total);
  });
  window.dispatchEvent(new CustomEvent("pl-cart-change", { detail: { total } }));
}

export function addToCart(item: CartItem) {
  const items = getCart();
  const existing = items.find((i) => i.type === item.type && i.id === item.id);
  if (existing) existing.quantity += item.quantity;
  else items.push(item);
  saveCart(items);
}

export function cartCount(): number {
  return getCart().reduce((s, i) => s + i.quantity, 0);
}
