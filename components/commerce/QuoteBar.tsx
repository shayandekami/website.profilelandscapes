"use client";

import { useEffect, useState } from "react";
import { quoteCount } from "@/lib/quoteCart";

/**
 * Global floating indicator for the quote cart. Hidden when empty.
 * Lives in the public layout so it's available on every page.
 */
export function QuoteBar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(quoteCount());
    update();
    window.addEventListener("pl-quote-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("pl-quote-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  if (count === 0) return null;

  return (
    <a
      href="/quote-cart"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "13px 20px",
        borderRadius: 999,
        background: "var(--ink, #133024)",
        color: "#fff",
        fontFamily: "var(--sans, 'Inter Tight', sans-serif)",
        fontSize: 14,
        fontWeight: 500,
        textDecoration: "none",
        boxShadow: "0 12px 30px rgba(19,48,36,0.28)",
      }}
    >
      <span aria-hidden="true">📋</span>
      Quote request
      <span
        style={{
          background: "#e8dcb6",
          color: "#0a1e15",
          borderRadius: 999,
          minWidth: 22,
          height: 22,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12.5,
          fontWeight: 600,
          padding: "0 6px",
        }}
      >
        {count}
      </span>
    </a>
  );
}
