import type { Metadata } from "next";
import { QuoteCartClient } from "./QuoteCartClient";

export const metadata: Metadata = {
  title: "Quote request — Profile Landscapes",
  description: "Review your selected plants and request a trade quote.",
};

export default function QuoteCartPage() {
  return (
    <div style={{ maxWidth: 920, margin: "64px auto 120px", padding: "0 24px" }}>
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--accent, #1f5a3d)",
          marginBottom: 8,
        }}
      >
        Trade &amp; bulk
      </p>
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300,
          fontSize: "clamp(36px, 5vw, 56px)",
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: "var(--ink, #133024)",
          margin: "0 0 14px",
        }}
      >
        Request a <span style={{ fontStyle: "italic", color: "var(--accent, #1f5a3d)" }}>quote.</span>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2, #3c554a)", maxWidth: "60ch", marginBottom: 36 }}>
        Add the lines you need at the sizes you want — including stock that&apos;s grown to order or
        not currently in the yard. We&apos;ll come back with trade rates, availability and lead times.
      </p>

      <QuoteCartClient />
    </div>
  );
}
