"use client";

import { useState } from "react";

export type CartItem = {
  type: "product" | "plant";
  id: number;
  name: string;
  image?: string;
  priceCents: number;
};

interface AddToCartButtonProps {
  item: CartItem;
  qty?: number;
  className?: string;
  label?: string;
}

const CART_KEY = "pl_cart";

type StoredCartItem = CartItem & { quantity: number };

function getCart(): StoredCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart: StoredCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function AddToCartButton({
  item,
  qty = 1,
  className,
  label = "Add to cart",
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    const cart = getCart();
    const existingIdx = cart.findIndex(
      (c) => c.type === item.type && c.id === item.id
    );
    if (existingIdx >= 0) {
      cart[existingIdx].quantity += qty;
    } else {
      cart.push({ ...item, quantity: qty });
    }
    saveCart(cart);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  return (
    <button
      onClick={handleAdd}
      className={className}
      style={{
        background: added ? "#16a34a" : "var(--color-accent, #2563eb)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 20px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {added ? "Added!" : label}
    </button>
  );
}
