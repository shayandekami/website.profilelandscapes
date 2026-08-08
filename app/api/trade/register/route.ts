import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { tradeAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const Schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  company: z.string().max(200).optional().or(z.literal("")),
  contactName: z.string().max(200).optional().or(z.literal("")),
  phone: z.string().max(60).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(`trade-reg:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please use a valid email and a password of at least 8 characters." }, { status: 400 });
  }
  const { email, password, company, contactName, phone } = parsed.data;

  const existing = await db.select().from(tradeAccounts).where(eq(tradeAccounts.email, email.toLowerCase())).limit(1);
  if (existing.length) {
    return NextResponse.json({ error: "An account with that email already exists. Try logging in." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // New self-registrations are PENDING at RETAIL pricing. A staff member verifies
  // the business and sets the correct tier via admin → trade-accounts. No trade
  // session is issued on signup, so registering never grants discounted pricing.
  const [acct] = await db
    .insert(tradeAccounts)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      company: company || null,
      contactName: contactName || null,
      phone: phone || null,
      status: "pending",
      priceTier: "retail",
    })
    .returning();

  try {
    const { notifyTradeWelcome } = await import("@/lib/email");
    await notifyTradeWelcome({ email: acct.email, company: acct.company });
  } catch (e) {
    console.error("[trade register] welcome email failed", e);
  }

  return NextResponse.json({
    ok: true,
    pending: true,
    message:
      "Thanks — your trade account is pending review. We'll email you once it's approved and your pricing is set.",
  });
}
