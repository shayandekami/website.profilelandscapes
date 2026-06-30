"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <section style={{ minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 24px", maxWidth: 720, margin: "0 auto" }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent, #1f5a3d)", marginBottom: 12 }}>
        Something went wrong
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "clamp(34px,5vw,52px)", letterSpacing: "-0.025em", margin: "0 0 14px", lineHeight: 1, color: "var(--ink, #133024)" }}>
        We hit a snag.
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2, #3c554a)", maxWidth: "52ch", marginBottom: 28 }}>
        This page didn&apos;t load properly. Try again, or head back home — if it keeps happening, let us know on (02) 9568 5868.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={reset} style={{ padding: "13px 24px", borderRadius: 999, background: "var(--ink, #133024)", color: "#fff", border: "none", fontSize: 14.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          Try again
        </button>
        <a href="/" style={{ padding: "13px 24px", borderRadius: 999, background: "#fff", color: "var(--ink, #133024)", border: "1px solid rgba(19,48,36,0.16)", fontSize: 14.5, fontWeight: 500, textDecoration: "none" }}>
          Back home
        </a>
      </div>
    </section>
  );
}
