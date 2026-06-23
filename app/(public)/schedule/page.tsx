import type { Metadata } from "next";
import { ScheduleClient } from "./ScheduleClient";

export const metadata: Metadata = {
  title: "Plant schedule — Profile Landscapes",
  description: "Compare your shortlisted plants side by side, export the schedule, or send it for a quote.",
};

export default function SchedulePage() {
  return (
    <div style={{ maxWidth: 1240, margin: "56px auto 100px", padding: "0 32px" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent, #1f5a3d)", marginBottom: 12 }}>
        Your shortlist
      </div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "clamp(36px,5vw,56px)", letterSpacing: "-0.025em", margin: "0 0 14px", lineHeight: 1, color: "var(--ink, #133024)" }}>
        Plant <span style={{ fontStyle: "italic", color: "var(--accent, #1f5a3d)" }}>schedule.</span>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2, #3c554a)", maxWidth: "60ch", marginBottom: 36 }}>
        Compare the species you&apos;re considering side by side. Export the list, or send the whole
        schedule to us for trade rates and availability.
      </p>
      <ScheduleClient />
    </div>
  );
}
