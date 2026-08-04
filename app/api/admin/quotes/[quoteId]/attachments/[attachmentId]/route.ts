import { readFile } from "node:fs/promises";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, quoteAttachments } from "@/lib/db";

type Props = { params: Promise<{ quoteId: string; attachmentId: string }> };
export async function GET(_: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { quoteId, attachmentId } = await params;
  const [file] = await db.select().from(quoteAttachments).where(and(eq(quoteAttachments.id, Number(attachmentId)), eq(quoteAttachments.quoteId, Number(quoteId)))).limit(1);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const bytes = await readFile(file.storedPath);
    return new NextResponse(bytes, { headers: {
      "Content-Type": file.mimeType, "Content-Disposition": `attachment; filename="${file.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    } });
  } catch {
    return NextResponse.json({ error: "Document unavailable" }, { status: 404 });
  }
}
