import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    const [quote] = await db
      .select({
        referenceCode: quotes.referenceCode,
        status: quotes.status,
        name: quotes.name,
        receivedAt: quotes.receivedAt,
        sector: quotes.sector,
        budget: quotes.budget,
      })
      .from(quotes)
      .where(eq(quotes.referenceCode, ref))
      .limit(1);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ quote });
  } catch (err) {
    console.error("[GET /api/quotes/[ref]]", err);
    return NextResponse.json({ error: "Failed to load quote" }, { status: 500 });
  }
}
