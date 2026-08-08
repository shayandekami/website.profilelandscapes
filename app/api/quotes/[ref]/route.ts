import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    const token = new URL(req.url).searchParams.get("token");
    const [quote] = await db
      .select({
        referenceCode: quotes.referenceCode,
        status: quotes.status,
        name: quotes.name,
        receivedAt: quotes.receivedAt,
        sector: quotes.sector,
        budget: quotes.budget,
        accessToken: quotes.accessToken,
      })
      .from(quotes)
      .where(eq(quotes.referenceCode, ref))
      .limit(1);

    // Require a matching access token ALWAYS — a quote with no token (legacy rows)
    // is not trackable via this public endpoint, so it can't be enumerated by ref.
    if (!quote || !quote.accessToken || token !== quote.accessToken) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ quote: {
      referenceCode: quote.referenceCode,
      status: quote.status,
      name: quote.name,
      receivedAt: quote.receivedAt,
      sector: quote.sector,
      budget: quote.budget,
    } });
  } catch (err) {
    console.error("[GET /api/quotes/[ref]]", err);
    return NextResponse.json({ error: "Failed to load quote" }, { status: 500 });
  }
}
