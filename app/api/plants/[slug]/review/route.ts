import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { plantReviews } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const rows = await db
    .select()
    .from(plantReviews)
    .where(and(eq(plantReviews.plantSlug, slug), eq(plantReviews.approved, true)))
    .orderBy(desc(plantReviews.createdAt))
    .limit(50);
  const count = rows.length;
  const avg = count ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  return NextResponse.json({
    avg,
    count,
    reviews: rows.map((r) => ({ author: r.author, rating: r.rating, body: r.body, createdAt: r.createdAt })),
  });
}

const Schema = z.object({
  author: z.string().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(2000).optional().or(z.literal("")),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(`review:${ip}`, 4, 60_000)) {
    return NextResponse.json({ error: "Too many submissions. Try again shortly." }, { status: 429 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please add your name and a 1–5 rating." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true }); // honeypot

  await db.insert(plantReviews).values({
    plantSlug: slug,
    author: parsed.data.author.trim(),
    rating: parsed.data.rating,
    body: parsed.data.body?.trim() || null,
    approved: false, // held for moderation
  });
  return NextResponse.json({ ok: true, pending: true });
}
