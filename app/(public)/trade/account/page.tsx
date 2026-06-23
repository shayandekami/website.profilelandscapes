import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTradeAccount, tierLabel, tierDiscountPct } from "@/lib/tradeAuth";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trade account — Profile Landscapes Nursery" };

export default async function TradeAccountPage() {
  const acct = await getTradeAccount();
  if (!acct) redirect("/trade/login");

  const pct = tierDiscountPct(acct.tier);
  const rows = [
    { k: "Email", v: acct.email },
    { k: "Company", v: acct.company || "—" },
    { k: "Price tier", v: `${tierLabel(acct.tier)}${pct ? ` — ${pct}% off list` : ""}` },
    { k: "Status", v: "Approved" },
  ];

  return (
    <div style={{ maxWidth: 640, margin: "72px auto 120px", padding: "0 24px" }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent, #1f5a3d)", marginBottom: 8 }}>Trade account</p>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "clamp(34px,5vw,52px)", letterSpacing: "-0.025em", margin: "0 0 14px", lineHeight: 1, color: "var(--ink, #133024)" }}>
        Welcome <span style={{ fontStyle: "italic", color: "var(--accent, #1f5a3d)" }}>back.</span>
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2, #3c554a)", marginBottom: 32 }}>
        {pct > 0
          ? `Your ${tierLabel(acct.tier).toLowerCase()} rate (−${pct}%) is applied across the nursery, pricelist and checkout.`
          : "Your account pricing is applied across the nursery and checkout."}
      </p>

      <div style={{ background: "var(--bone, #f4efe4)", borderRadius: 8, padding: "8px 24px", marginBottom: 28 }}>
        {rows.map((r) => (
          <div key={r.k} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--line-2, #e2ddcf)", fontSize: 15 }}>
            <span style={{ color: "var(--ink-2, #3c554a)" }}>{r.k}</span>
            <span style={{ color: "var(--ink, #133024)", fontWeight: 500 }}>{r.v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/plants/pricelist" style={{ padding: "12px 22px", borderRadius: 999, background: "var(--ink, #133024)", color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Browse pricelist →</a>
        <a href="/quote-cart" style={{ padding: "12px 22px", borderRadius: 999, background: "#fff", color: "var(--ink, #133024)", border: "1px solid rgba(19,48,36,0.16)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>My quote request</a>
        <LogoutButton />
      </div>
    </div>
  );
}
