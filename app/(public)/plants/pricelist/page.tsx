import type { Metadata } from "next";
import { db, plants } from "@/lib/db";
import { eq } from "drizzle-orm";
import { PricelistTable } from "./PricelistTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trade pricelist — Profile Landscapes Nursery",
  description: "Full nursery stock list with trade rates by pot size. Add lines to a quote or buy in-stock items directly.",
};

export default async function PricelistPage() {
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
          Landscaper or builder?{" "}
          <a href="/trade/login" style={{ color: "var(--ink, #133024)", textDecoration: "underline", textUnderlineOffset: 3 }}>Log in</a>{" "}
          or{" "}
          <a href="/trade/register" style={{ color: "var(--ink, #133024)", textDecoration: "underline", textUnderlineOffset: 3 }}>open a trade account</a>{" "}
          to see your rates applied.
        </p>
      </div>
      <PricelistTable rows={rows} />
    </div>
  );
}
