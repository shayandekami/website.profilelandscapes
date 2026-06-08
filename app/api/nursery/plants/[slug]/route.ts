import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [plant] = await db
      .select()
      .from(plants)
      .where(and(eq(plants.slug, slug), eq(plants.status, "live")))
      .limit(1);

    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json({ plant });
  } catch (err) {
    console.error("[GET /api/nursery/plants/[slug]]", err);
    return NextResponse.json({ error: "Failed to load plant" }, { status: 500 });
  }
}
