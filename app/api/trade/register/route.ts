import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { tradeAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { makeToken, SESSION_COOKIE, TIER_COOKIE_NAME, SESSION_MAX_AGE, tierLabel } from "@/lib/tradeAuth";

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

  const passwordHash = await bcrypt.hash(password, 10);
  // Demo: auto-approve to the 'trade' tier. In production this would be 'pending'
  // until a staff member verifies the business and sets the correct tier.
  const [acct] = await db
    .insert(tradeAccounts)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      company: company || null,
      contactName: contactName || null,
      phone: phone || null,
      status: "approved",
      priceTier: "trade",
    })
    .returning();

  try {
    const { notifyTradeWelcome } = await import("@/lib/email");
    await notifyTradeWelcome({ email: acct.email, company: acct.company });
  } catch (e) {
    console.error("[trade register] welcome email failed", e);
  }

  const token = makeToken({ id: acct.id, email: acct.email, tier: "trade", company: acct.company });
  const res = NextResponse.json({ ok: true, tier: "trade", tierLabel: tierLabel("trade") });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE });
  res.cookies.set(TIER_COOKIE_NAME, "trade", { httpOnly: false, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE });
  return res;
}
