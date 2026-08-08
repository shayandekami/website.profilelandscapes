import type { Metadata } from "next";
import { db, plants } from "@/lib/db";
import { eq } from "drizzle-orm";
import { PricelistTable } from "./PricelistTable";
import { featureAccess, getSiteSettings } from "@/lib/content";
import { FeatureUnavailable } from "@/components/commerce/FeatureUnavailable";
import { getTradeAccount } from "@/lib/tradeAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trade pricelist — Profile Landscapes Nursery",
  description: "Full nursery stock list with trade rates by pot size. Add lines to a quote or buy in-stock items directly.",
};

export default async function PricelistPage() {
  const settings = await getSiteSettings();
  const _gate = await featureAccess("nursery");
  if (!_gate.visible) {
    return <FeatureUnavailable eyebrow="Trade nursery" title="The online pricelist is currently unavailable." body="Contact the nursery team for current stock, trade rates, bulk pricing and lead times." />;
  }

  // TRADE-ONLY: this page publishes wholesale/trade rates, so it is restricted to
  // approved trade accounts. The public plant catalogue (/plants) stays open, so
  // retail customers and search engines still see the range — just not our rates.
  const tradeAcct = await getTradeAccount();
  if (!tradeAcct) return <TradeGate />;

  const rows = await db
    .select({
      id: plants.id,
      slug: plants.slug,
      latinName: plants.latinName,
      commonName: plants.commonName,
      family: plants.family,
      priceCents: plants.priceCents,
      size: plants.size,
      variants: plants.variants,
      stockQty: plants.stockQty,
      tags: plants.tags,
    })
    .from(plants)
    .where(eq(plants.status, "live"))
    .orderBy(plants.latinName);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 40px 100px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent, #1f5a3d)", marginBottom: 10 }}>
          Trade &amp; wholesale
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "clamp(36px,5vw,60px)", letterSpacing: "-0.025em", margin: "0 0 12px", lineHeight: 1, color: "var(--ink, #133024)" }}>
          Nursery <span style={{ fontStyle: "italic", color: "var(--accent, #1f5a3d)" }}>pricelist.</span>
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2, #3c554a)", maxWidth: "70ch" }}>
          {rows.length} lines grown across our Petersham and partner nurseries. Rates shown are
          per pot size. In-stock lines can be bought directly; everything can be added to a quote
          request for trade rates, bulk pricing and lead times. Prices include GST.
        </p>
        <p style={{ fontSize: 14, color: "var(--ink-2, #3c554a)", marginTop: 10 }}>
          Signed in as{" "}
          <b style={{ color: "var(--ink, #133024)" }}>{tradeAcct.company || tradeAcct.email}</b>
          {" — "}
          <span style={{ color: "var(--accent, #1f5a3d)", fontWeight: 600 }}>
            {tradeAcct.tier === "contract" ? "Contract" : tradeAcct.tier === "trade" ? "Trade" : "Retail"} pricing
          </span>
          .{" "}
          <a href="/trade/account" style={{ color: "var(--ink, #133024)", textDecoration: "underline", textUnderlineOffset: 3 }}>Your account</a>
        </p>
      </div>
      <PricelistTable rows={rows} />
    </div>
  );
}

/** Shown to anyone who is not an approved trade account. */
function TradeGate() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 40px 120px" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent, #1f5a3d)", marginBottom: 12 }}>
        Trade &amp; wholesale
      </div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 300, fontSize: "clamp(32px,4.5vw,52px)", letterSpacing: "-0.025em", margin: "0 0 16px", lineHeight: 1.05, color: "var(--ink, #133024)" }}>
        Trade rates are for <span style={{ fontStyle: "italic", color: "var(--accent, #1f5a3d)" }}>account holders.</span>
      </h1>
      <p style={{ fontSize: 16.5, lineHeight: 1.65, color: "var(--ink-2, #3c554a)", maxWidth: "62ch" }}>
        Our nursery pricelist — trade rates by pot size, live stock and lead times — is
        available to approved trade accounts. Accounts are free for landscapers, builders
        and councils, and are usually approved within one business day.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
        <a href="/trade/register" style={{ padding: "13px 22px", borderRadius: 999, background: "var(--ink, #133024)", color: "#fff", fontSize: 14.5, fontWeight: 500, textDecoration: "none" }}>
          Open a trade account →
        </a>
        <a href="/trade/login" style={{ padding: "13px 22px", borderRadius: 999, border: "1px solid var(--line-2, #dcd4bf)", color: "var(--ink, #133024)", fontSize: 14.5, fontWeight: 500, textDecoration: "none" }}>
          Log in
        </a>
      </div>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-2, #3c554a)", marginTop: 34, paddingTop: 22, borderTop: "1px solid var(--line-2, #dcd4bf)" }}>
        Not in the trade? Browse the{" "}
        <a href="/plants" style={{ color: "var(--ink, #133024)", textDecoration: "underline", textUnderlineOffset: 3 }}>full plant range</a>{" "}
        or{" "}
        <a href="/quote" style={{ color: "var(--ink, #133024)", textDecoration: "underline", textUnderlineOffset: 3 }}>request a quote</a>{" "}
        and we&apos;ll price your project.
      </p>
    </div>
  );
}
