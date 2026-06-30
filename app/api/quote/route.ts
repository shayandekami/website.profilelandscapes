import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quotes } from "@/lib/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { generateQuoteRef } from "@/lib/commerce";
import { sql } from "drizzle-orm";

const Schema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional().or(z.literal("")),
  email: z.string().email().max(255),
  phone: z.string().max(60).optional().or(z.literal("")),
  sector: z.string().max(60).optional().or(z.literal("")),
  budget: z.string().max(60).optional().or(z.literal("")),
  brief: z.string().min(10).max(5000),
  // honeypot — must be empty
  website: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!rateLimit(`quote:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 }
    );
  }

  // Honeypot trip — pretend success without saving
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  // Generate a unique reference code (Q-YYYY-NNNN)
  // Use the current count of quotes to generate a sequential ref
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(quotes);
  const nextSeq = (countResult[0]?.count ?? 0) + 1;
  const referenceCode = generateQuoteRef(nextSeq);

  const inserted = await db
    .insert(quotes)
    .values({
      referenceCode,
      name: parsed.data.name,
      company: parsed.data.company || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      sector: parsed.data.sector || null,
      budget: parsed.data.budget || null,
      brief: parsed.data.brief,
      source: "website",
    })
    .returning({ id: quotes.id, referenceCode: quotes.referenceCode });

  const ref = inserted[0]?.referenceCode || referenceCode;

  const notifyTo = process.env.QUOTE_NOTIFY_EMAIL;
  if (notifyTo) {
    const { sendEmail } = await import("@/lib/email");
    const lines = [
      `New quote enquiry ${ref}`,
      ``,
      `Name:    ${parsed.data.name}`,
      `Company: ${parsed.data.company || "—"}`,
      `Email:   ${parsed.data.email}`,
      `Phone:   ${parsed.data.phone || "—"}`,
      `Sector:  ${parsed.data.sector || "—"}`,
      `Budget:  ${parsed.data.budget || "—"}`,
      ``,
      `Brief:`,
      parsed.data.brief,
      ``,
      `Track status: ${process.env.AUTH_URL || "http://localhost:3000"}/quote/${ref}`,
      `Open in admin: ${process.env.AUTH_URL || "http://localhost:3000"}/admin/quotes`,
    ];
    await sendEmail({
      to: notifyTo,
      subject: `Quote ${ref} — ${parsed.data.company || parsed.data.name}`,
      text: lines.join("\n"),
      replyTo: parsed.data.email,
    }).catch((e) => console.error("[quote] email failed", e));
  }

  // Customer acknowledgement (graceful — never blocks the response)
  try {
    const { notifyCustomerQuoteAck } = await import("@/lib/email");
    await notifyCustomerQuoteAck({ ref, name: parsed.data.name, email: parsed.data.email });
  } catch (e) {
    console.error("[quote] customer ack failed", e);
  }

  return NextResponse.json({ ok: true, id: inserted[0]?.id, referenceCode: ref });
}
