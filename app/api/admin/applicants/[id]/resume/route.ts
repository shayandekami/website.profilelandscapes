import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { careerApplications, db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [application] = await db.select().from(careerApplications).where(eq(careerApplications.id, Number(id))).limit(1);
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const bytes = await readFile(application.resumePath);
    return new NextResponse(bytes, { headers: {
      "Content-Type": application.resumeMime,
      "Content-Disposition": `attachment; filename="${application.resumeFilename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    } });
  } catch {
    return NextResponse.json({ error: "CV file is unavailable" }, { status: 404 });
  }
}
