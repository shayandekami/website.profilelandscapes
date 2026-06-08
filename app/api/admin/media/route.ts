import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, media } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(200);

  return NextResponse.json({
    items: rows.map((m) => ({
      id: m.id,
      url: m.url,
      filename: m.filename,
      alt: m.alt,
      sizeBytes: m.sizeBytes,
      createdAt: m.createdAt,
    })),
  });
}
