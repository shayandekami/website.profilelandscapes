"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function QuoteLookupForm() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = ref.trim().toUpperCase();
    if (!cleaned) {
      setError("Please enter your reference number.");
      return;
    }
    // Accept formats like PL-2026-1234 or pl20261234 — normalise loosely
    if (!/^PL[-\s]?\d{4}[-\s]?\d{3,4}$/i.test(cleaned)) {
      setError("That doesn't look like a valid reference (e.g. PL-2026-1234).");
      return;
    }
    setError("");
    router.push(`/quote/${encodeURIComponent(cleaned)}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          type="text"
          value={ref}
          onChange={(e) => {
            setRef(e.target.value);
            if (error) setError("");
          }}
          placeholder="PL-2026-1234"
          aria-label="Quote reference number"
          style={{
            flex: "1 1 240px",
            border: `1px solid ${error ? "#c2783a" : "rgba(19,48,36,0.18)"}`,
            background: "#fff",
            padding: "14px 18px",
            borderRadius: 8,
            fontSize: 16,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
            color: "var(--ink, #133024)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "14px 28px",
            borderRadius: 999,
            background: "var(--ink, #133024)",
            color: "#fff",
            border: "none",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Track quote →
        </button>
      </div>
      {error && (
        <p style={{ margin: "12px 2px 0", fontSize: 13.5, color: "#c2783a" }}>{error}</p>
      )}
    </form>
  );
}
