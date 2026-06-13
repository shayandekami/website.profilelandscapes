import type { Metadata } from "next";
import { QuoteLookupForm } from "./QuoteLookupForm";

export const metadata: Metadata = {
  title: "Track your quote — Profile Landscapes",
  description: "Enter your reference number to check the status of your quote enquiry.",
};

export default function QuoteLandingPage() {
  return (
    <div style={{ maxWidth: 680, margin: "80px auto 120px", padding: "0 24px" }}>
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--moss, #3c554a)",
          marginBottom: 8,
        }}
      >
        Quote tracker
      </p>
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300,
          fontSize: "clamp(40px, 6vw, 64px)",
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: "var(--ink, #133024)",
          margin: "0 0 16px",
        }}
      >
        Track your{" "}
        <span style={{ fontStyle: "italic", color: "var(--accent, #1f5a3d)" }}>quote.</span>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--moss, #3c554a)", maxWidth: "48ch", marginBottom: 40 }}>
        Enter the reference number from your enquiry confirmation (it looks like{" "}
        <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--ink, #133024)" }}>PL-2026-1234</code>)
        to see where your quote is up to.
      </p>

      <QuoteLookupForm />

      {/* Help note */}
      <div
        style={{
          marginTop: 48,
          padding: "20px 24px",
          background: "var(--bone, #f4efe4)",
          borderRadius: 8,
          fontSize: 14,
          color: "var(--moss, #3c554a)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--ink, #133024)", fontWeight: 500 }}>Can&apos;t find your reference?</strong>
        <br />
        It&apos;s in the confirmation email we sent when you submitted your enquiry. If you can&apos;t
        locate it, email{" "}
        <a href="mailto:carlo@profilelandscapes.com.au" style={{ color: "var(--ink, #133024)" }}>
          carlo@profilelandscapes.com.au
        </a>{" "}
        or call (02) 9560 3888 and we&apos;ll look it up for you.
      </div>

      {/* No quote yet CTA */}
      <p style={{ fontSize: 14, color: "var(--moss, #3c554a)", marginTop: 32 }}>
        Haven&apos;t requested a quote yet?{" "}
        <a href="/contact" style={{ color: "var(--ink, #133024)", borderBottom: "1px solid var(--line, rgba(19,48,36,0.2))", paddingBottom: 1, textDecoration: "none" }}>
          Start an enquiry →
        </a>
      </p>
    </div>
  );
}
