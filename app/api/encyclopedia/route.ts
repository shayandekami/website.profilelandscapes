import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encyclopediaEntries } from "@/lib/db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const featured = searchParams.get("featured");
    const q = searchParams.get("q");

    const rows = await db
      .select()
      .from(encyclopediaEntries)
      .where(
        and(
          eq(encyclopediaEntries.status, "live"),
          featured === "1" ? eq(encyclopediaEntries.featured, true) : undefined,
          tag
            ? sql`${encyclopediaEntries.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`
            : undefined,
          q
            ? ilike(encyclopediaEntries.commonName, `%${q}%`)
            : undefined
        )
      )
      .orderBy(encyclopediaEntries.latinName);

    return NextResponse.json({ entries: rows });
  } catch (err) {
    console.error("[GET /api/encyclopedia]", err);
    return NextResponse.json({ error: "Failed to load encyclopedia entries" }, { status: 500 });
  }
}
