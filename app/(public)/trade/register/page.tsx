import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTradeAccount } from "@/lib/tradeAuth";
import { TradeAuthForm } from "../TradeAuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Open a trade account — Profile Landscapes Nursery" };

export default async function TradeRegisterPage() {
  if (await getTradeAccount()) redirect("/trade/account");
  return (
    <div style={{ maxWidth: 560, margin: "72px auto 120px", padding: "0 24px" }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent, #1f5a3d)", marginBottom: 8 }}>Trade &amp; wholesale</p>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "clamp(34px,5vw,52px)", letterSpacing: "-0.025em", margin: "0 0 14px", lineHeight: 1, color: "var(--ink, #133024)" }}>
        Open a <span style={{ fontStyle: "italic", color: "var(--accent, #1f5a3d)" }}>trade account.</span>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2, #3c554a)", maxWidth: "52ch", marginBottom: 32 }}>
        For landscapers, builders and councils. Get trade rates across the full range, save quotes, and check out at your account price.
      </p>
      <TradeAuthForm mode="register" />
    </div>
  );
}
