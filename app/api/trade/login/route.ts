import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { tradeAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { makeToken, SESSION_COOKIE, TIER_COOKIE_NAME, SESSION_MAX_AGE, tierLabel, type TradeTier } from "@/lib/tradeAuth";

export const dynamic = "force-dynamic";

const Schema = z.object({ email: z.string().email().max(255), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(`trade-login:${ip}`, 8, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

  const { email, password } = parsed.data;
  const [acct] = await db.select().from(tradeAccounts).where(eq(tradeAccounts.email, email.toLowerCase())).limit(1);

  // Constant-ish path: always run a bcrypt compare to reduce user enumeration.
  const ok = acct ? await bcrypt.compare(password, acct.passwordHash) : await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidin");
  if (!acct || !ok) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  if (acct.status === "suspended") {
    return NextResponse.json({ error: "This account is suspended. Contact us to reactivate." }, { status: 403 });
  }
  if (acct.status !== "approved") {
    return NextResponse.json({ error: "Your account is awaiting approval. We'll email you once it's active." }, { status: 403 });
  }

  const tier = acct.priceTier as TradeTier;
  const token = makeToken({ id: acct.id, email: acct.email, tier, company: acct.company });
  const res = NextResponse.json({ ok: true, tier, tierLabel: tierLabel(tier) });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE });
  res.cookies.set(TIER_COOKIE_NAME, tier, { httpOnly: false, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE });
  return res;
}
