import { NextResponse } from "next/server";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db, quoteAttachments, quotes } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const MAX_FILE = 15 * 1024 * 1024;
const MAX_TOTAL = 40 * 1024 * 1024;
const MAX_FILES = 6;
const ALLOWED_EXT = new Set(["pdf","doc","docx","xls","xlsx","jpg","jpeg","png","webp","dwg","dxf","zip"]);

const Schema = z.object({
  name: z.string().trim().min(1).max(200), company: z.string().trim().max(200).optional(),
  email: z.string().trim().email().max(255), phone: z.string().trim().max(60).optional(),
  sector: z.string().trim().max(60).optional(), budget: z.string().trim().max(60).optional(),
  siteAddress: z.string().trim().min(2).max(300), postcode: z.string().regex(/^\d{4}$/),
  projectStage: z.string().trim().min(2).max(80), services: z.array(z.string().max(100)).min(1).max(8),
  desiredStart: z.string().trim().max(100).optional(), tenderDue: z.string().optional(),
  contactPreference: z.string().trim().max(40).optional(), architect: z.string().trim().max(200).optional(),
  brief: z.string().trim().min(80).max(8000), website: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(`quote:${ip}`, 5, 60_000)) return NextResponse.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "We could not read the submitted files. Check their size and try again." }, { status: 400 });
  }
  const parsed = Schema.safeParse({
    name: form.get("name"), company: form.get("company") || undefined, email: form.get("email"),
    phone: form.get("phone") || undefined, sector: form.get("sector") || undefined, budget: form.get("budget") || undefined,
    siteAddress: form.get("siteAddress"), postcode: form.get("postcode"), projectStage: form.get("projectStage"),
    services: form.getAll("services").map(String), desiredStart: form.get("desiredStart") || undefined,
    tenderDue: form.get("tenderDue") || undefined, contactPreference: form.get("contactPreference") || undefined,
    architect: form.get("architect") || undefined, brief: form.get("brief"), website: form.get("website") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check the project details." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const files = form.getAll("attachments").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > MAX_FILES) return NextResponse.json({ error: `Upload no more than ${MAX_FILES} files.` }, { status: 400 });
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL) return NextResponse.json({ error: "Combined files exceed 40 MB." }, { status: 400 });
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (file.size > MAX_FILE) return NextResponse.json({ error: `${file.name} exceeds 15 MB.` }, { status: 400 });
    if (!ALLOWED_EXT.has(ext)) return NextResponse.json({ error: `${file.name} is not an accepted document type.` }, { status: 400 });
  }

  const referenceCode = `Q-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;
  const accessToken = nanoid(40);
  const [quote] = await db.insert(quotes).values({
    referenceCode, accessToken, name: parsed.data.name, company: parsed.data.company || null,
    email: parsed.data.email.toLowerCase(), phone: parsed.data.phone || null, sector: parsed.data.sector || null,
    budget: parsed.data.budget || null, siteAddress: parsed.data.siteAddress, postcode: parsed.data.postcode,
    projectStage: parsed.data.projectStage, services: parsed.data.services, desiredStart: parsed.data.desiredStart || null,
    tenderDue: parsed.data.tenderDue ? new Date(`${parsed.data.tenderDue}T12:00:00`) : null,
    contactPreference: parsed.data.contactPreference || null, architect: parsed.data.architect || null,
    brief: parsed.data.brief, source: "website-quote-request",
  }).returning();

  const storageDir = join(process.cwd(), "storage", "quotes", String(quote.id));
  try {
    if (files.length) {
      await mkdir(storageDir, { recursive: true });
      for (const file of files) {
        const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 180);
        const storedPath = join(storageDir, `${nanoid(8)}-${safe}`);
        await writeFile(storedPath, Buffer.from(await file.arrayBuffer()));
        await db.insert(quoteAttachments).values({ quoteId: quote.id, storedPath, filename: safe, mimeType: file.type || "application/octet-stream", sizeBytes: file.size });
      }
    }
  } catch (error) {
    await db.delete(quotes).where(eq(quotes.id, quote.id)).catch(() => undefined);
    await rm(storageDir, { recursive: true, force: true }).catch(() => undefined);
    console.error("[quote] attachment storage failed", error);
    return NextResponse.json({ error: "We could not safely store your documents. Please try again or email the tender contact shown on this page." }, { status: 500 });
  }

  try {
    const { notifyCustomerQuoteAck, sendEmail } = await import("@/lib/email");
    await notifyCustomerQuoteAck({ ref: referenceCode, name: parsed.data.name, email: parsed.data.email, token: accessToken, origin: new URL(request.url).origin });
    const notifyTo = process.env.QUOTE_NOTIFY_EMAIL;
    if (notifyTo) await sendEmail({
      to: notifyTo, replyTo: parsed.data.email, subject: `Quote ${referenceCode} — ${parsed.data.company || parsed.data.name}`,
      text: `New quote request\n\nSite: ${parsed.data.siteAddress} ${parsed.data.postcode}\nStage: ${parsed.data.projectStage}\nServices: ${parsed.data.services.join(", ")}\nBudget: ${parsed.data.budget || "Not supplied"}\nAttachments: ${files.length}\n\n${parsed.data.brief}`,
    });
  } catch (error) { console.error("[quote] notification failed", error); }

  return NextResponse.json({ ok: true, id: quote.id, referenceCode, accessToken });
}
