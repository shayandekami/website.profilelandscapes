import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plants } from "@/lib/db/schema";
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
      .from(plants)
      .where(
        and(
          eq(plants.status, "live"),
          featured === "1" ? eq(plants.featured, true) : undefined,
          tag
            ? sql`${plants.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`
            : undefined,
          q
            ? ilike(plants.commonName, `%${q}%`)
            : undefined
        )
      )
      .orderBy(plants.createdAt);

    return NextResponse.json({ plants: rows });
  } catch (err) {
    console.error("[GET /api/nursery/plants]", err);
    return NextResponse.json({ error: "Failed to load plants" }, { status: 500 });
  }
}
