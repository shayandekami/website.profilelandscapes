import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { db, media, auditLog } from "@/lib/db";

const MAX = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 400 });
  }

  // Filename: <random>-<original-safe>.<ext>
  const orig = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").toLowerCase();
  const filename = `${nanoid(8)}-${orig}`.slice(0, 200);
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  const url = `/uploads/${filename}`;

  const [row] = await db
    .insert(media)
    .values({
      filename,
      url,
      sizeBytes: file.size,
      uploadedById: Number(session.user.id),
    })
    .returning();

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "media.upload",
    resource: "media",
    resourceId: String(row.id),
    meta: { filename, size: file.size },
  });

  return NextResponse.json({ ok: true, id: row.id, url, filename });
}
