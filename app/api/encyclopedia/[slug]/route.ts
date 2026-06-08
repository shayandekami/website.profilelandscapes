import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encyclopediaEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [entry] = await db
      .select()
      .from(encyclopediaEntries)
      .where(
        and(
          eq(encyclopediaEntries.slug, slug),
          eq(encyclopediaEntries.status, "live")
        )
      )
      .limit(1);

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (err) {
    console.error("[GET /api/encyclopedia/[slug]]", err);
    return NextResponse.json({ error: "Failed to load entry" }, { status: 500 });
  }
}
