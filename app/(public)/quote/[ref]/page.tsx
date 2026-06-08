import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { quotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; step: number; description: string }> = {
  new:          { label: "Received", step: 1, description: "We've received your brief and will be in touch shortly." },
  in_reply:     { label: "Under review", step: 2, description: "Your project is being reviewed by our studio team." },
  site_visit:   { label: "Site visit scheduled", step: 3, description: "We're arranging a site inspection or consultation." },
  won:          { label: "Proposal accepted", step: 4, description: "Your project has been accepted. Welcome to the team." },
  lost:         { label: "Not proceeding", step: 4, description: "Thank you for your enquiry. We weren't the right fit this time." },
  out_of_scope: { label: "Outside our scope", step: 4, description: "This project falls outside our current service area or capability." },
};

const STEPS = ["Received", "Under review", "Site visit", "Outcome"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  return {
    title: `Quote ${ref} — Status`,
    description: "Track the status of your quote enquiry.",
  };
}

export default async function QuoteTrackerPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;

  const row = await db.query.quotes.findFirst({
    where: eq(quotes.referenceCode, ref.toUpperCase()),
  }).catch(() => null);

  if (!row) notFound();

  const status = STATUS_LABELS[row.status] ?? STATUS_LABELS.new;
  const received = new Date(row.receivedAt);

  return (
    <div style={{ maxWidth: 680, margin: "80px auto 120px", padding: "0 24px" }}>
      {/* Reference header */}
      <div style={{ marginBottom: 48 }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--moss, #3c554a)",
          marginBottom: 8,
        }}>
          Quote reference
        </p>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 300,
          fontSize: "clamp(40px, 6vw, 64px)",
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: "var(--ink, #133024)",
          margin: "0 0 12px",
        }}>
          {row.referenceCode}
        </h1>
        <p style={{ fontSize: 15, color: "var(--moss, #3c554a)" }}>
          Submitted {received.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
          {row.sector ? ` · ${row.sector}` : ""}
          {row.budget ? ` · ${row.budget}` : ""}
        </p>
      </div>

      {/* Progress steps */}
      <div style={{
        display: "flex",
        gap: 0,
        marginBottom: 48,
        background: "var(--bone, #f4efe4)",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid rgba(19,48,36,0.1)",
      }}>
        {STEPS.map((stepLabel, i) => {
          const stepNum = i + 1;
          const isComplete = status.step > stepNum;
          const isCurrent = status.step === stepNum;
          const isPending = status.step < stepNum;
          return (
            <div key={stepLabel} style={{
              flex: 1,
              padding: "18px 14px",
              textAlign: "center",
              background: isCurrent ? "var(--ink, #133024)" : isComplete ? "var(--accent, #1f5a3d)" : "transparent",
              borderRight: i < STEPS.length - 1 ? "1px solid rgba(19,48,36,0.1)" : "none",
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: (isCurrent || isComplete) ? "rgba(255,255,255,0.7)" : "var(--moss, #3c554a)",
                marginBottom: 4,
              }}>
                Step {stepNum}
              </div>
              <div style={{
                fontSize: 12,
                fontWeight: 500,
                color: (isCurrent || isComplete) ? "#fff" : isPending ? "var(--moss, #3c554a)" : "var(--ink, #133024)",
              }}>
                {isComplete ? "✓ " : ""}{stepLabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current status card */}
      <div style={{
        padding: "28px 32px",
        background: "#fff",
        border: "1px solid rgba(19,48,36,0.12)",
        borderRadius: 8,
        marginBottom: 32,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--sage, #1f5a3d)",
          marginBottom: 10,
        }}>
          Current status
        </div>
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 400,
          fontSize: 28,
          letterSpacing: "-0.01em",
          color: "var(--ink, #133024)",
          margin: "0 0 10px",
        }}>
          {status.label}
        </h2>
        <p style={{ fontSize: 15, color: "var(--moss, #3c554a)", lineHeight: 1.6, margin: 0 }}>
          {status.description}
        </p>
      </div>

      {/* Enquiry details */}
      <div style={{
        padding: "20px 24px",
        background: "var(--bone, #f4efe4)",
        borderRadius: 8,
        fontSize: 14,
        color: "var(--moss, #3c554a)",
        marginBottom: 48,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px 16px" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Name</span>
          <span>{row.name}</span>
          {row.sector && <>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sector</span>
            <span>{row.sector}</span>
          </>}
          {row.budget && <>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Budget</span>
            <span>{row.budget}</span>
          </>}
        </div>
      </div>

      {/* Contact note */}
      <p style={{ fontSize: 14, color: "var(--moss, #3c554a)", lineHeight: 1.6 }}>
        Questions about your quote? Email{" "}
        <a href="mailto:carlo@profilelandscapes.com.au" style={{ color: "var(--ink, #133024)" }}>
          carlo@profilelandscapes.com.au
        </a>{" "}
        and quote your reference number.
      </p>
    </div>
  );
}
