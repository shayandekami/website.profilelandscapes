import { NextResponse } from "next/server";
import { SESSION_COOKIE, TIER_COOKIE_NAME } from "@/lib/tradeAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set(TIER_COOKIE_NAME, "", { httpOnly: false, path: "/", maxAge: 0 });
  return res;
}
