import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { tradeAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Trade-account auth — a lightweight, self-contained session for wholesale/
 * landscape buyers, separate from the CMS admin auth (next-auth). Sessions are
 * an HMAC-signed cookie (pl_trade, httpOnly) over AUTH_SECRET; a parallel
 * readable cookie (pl_trade_tier) lets client components show trade pricing.
 * The server (checkout/validate) is always authoritative on price.
 */

export type TradeTier = "retail" | "trade" | "contract";
export type TradeSession = { id: number; email: string; tier: TradeTier; company: string | null };

const SECRET = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
const COOKIE = "pl_trade";
const TIER_COOKIE = "pl_trade_tier";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ---- price tiers ----
export function tierMultiplier(tier: TradeTier): number {
  return tier === "contract" ? 0.75 : tier === "trade" ? 0.85 : 1;
}
export function tierDiscountPct(tier: TradeTier): number {
  return Math.round((1 - tierMultiplier(tier)) * 100);
}
export function tierLabel(tier: TradeTier): string {
  return tier === "contract" ? "Contract" : tier === "trade" ? "Trade" : "Retail";
}

// ---- token signing (HMAC) ----
function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}
function verify(token: string): (TradeSession & { exp: number }) | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const obj = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!obj.exp || obj.exp < Date.now()) return null;
    return obj;
  } catch {
    return null;
  }
}

export function makeToken(s: TradeSession): string {
  return sign({ ...s, exp: Date.now() + MAX_AGE * 1000 });
}

export const SESSION_COOKIE = COOKIE;
export const TIER_COOKIE_NAME = TIER_COOKIE;
export const SESSION_MAX_AGE = MAX_AGE;

/**
 * Read the current trade session from cookies and re-validate against the DB
 * (so a suspended/removed account loses pricing immediately). Returns null if
 * not logged in or not approved.
 */
export async function getTradeAccount(): Promise<TradeSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const claims = verify(token);
  if (!claims) return null;
  const [row] = await db
    .select()
    .from(tradeAccounts)
    .where(eq(tradeAccounts.id, claims.id))
    .limit(1);
  if (!row || row.status !== "approved") return null;
  return { id: row.id, email: row.email, tier: row.priceTier as TradeTier, company: row.company };
}
