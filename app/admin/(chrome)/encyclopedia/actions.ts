"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, encyclopediaEntries, auditLog } from "@/lib/db";
import type { PlantCare, PlantSeasons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

// ---------- helpers ----------
function parseCsvArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

function parseImages(raw: string | null | undefined): Array<{ url: string; alt?: string }> {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function parseMonths(formData: FormData, field: string): number[] {
  return formData
    .getAll(field)
    .map(Number)
    .filter((n) => n >= 1 && n <= 12);
}

function buildCare(formData: FormData): PlantCare | undefined {
  const water = (formData.get("care_water") as string) || "";
  const light = (formData.get("care_light") as string) || "";
  const soil = (formData.get("care_soil") as string) || "";
  const growthRate = (formData.get("care_growthRate") as string) || "";
  const matureSize = (formData.get("care_matureSize") as string) || "";
  if (!water && !light && !soil && !growthRate && !matureSize) return undefined;
  return { water, light, soil, growthRate, matureSize };
}

function buildSeasons(formData: FormData): PlantSeasons | undefined {
  const flowering = parseMonths(formData, "flowering_months");
  const fruiting = parseMonths(formData, "fruiting_months");
  if (flowering.length === 0 && fruiting.length === 0) return undefined;
  const s: PlantSeasons = {};
  if (flowering.length > 0) s.flowering = flowering;
  if (fruiting.length > 0) s.fruiting = fruiting;
  return s;
}

// ---------- validation ----------
const EntryInput = z.object({
  latinName: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  commonName: z.string().max(200).optional().or(z.literal("")),
  family: z.string().max(100).optional().or(z.literal("")),
  genus: z.string().max(100).optional().or(z.literal("")),
  description: z.string().max(20000).optional().or(z.literal("")),
  climateZonesRaw: z.string().optional().or(z.literal("")),
  tagsRaw: z.string().optional().or(z.literal("")),
  companionsRaw: z.string().optional().or(z.literal("")),
  pestNotes: z.string().max(5000).optional().or(z.literal("")),
  propagation: z.string().max(5000).optional().or(z.literal("")),
  landscapeUse: z.string().max(5000).optional().or(z.literal("")),
  featured: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
  status: z.enum(["draft", "live"]),
  imagesJson: z.string().optional().or(z.literal("")),
});

// ---------- create ----------
export async function createEntry(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const raw = Object.fromEntries(formData.entries());
  const parsed = EntryInput.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid input");
  }
  const d = parsed.data;

  const [inserted] = await db
    .insert(encyclopediaEntries)
    .values({
      slug: d.slug,
      latinName: d.latinName,
      commonName: d.commonName || null,
      family: d.family || null,
      genus: d.genus || null,
      description: d.description || null,
      climateZones: parseCsvArray(d.climateZonesRaw),
      tags: parseTags(d.tagsRaw),
      care: buildCare(formData),
      seasons: buildSeasons(formData),
      companions: parseCsvArray(d.companionsRaw),
      pestNotes: d.pestNotes || null,
      propagation: d.propagation || null,
      landscapeUse: d.landscapeUse || null,
      featured: d.featured,
      status: d.status,
      images: parseImages(d.imagesJson),
    })
    .returning({ id: encyclopediaEntries.id });

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "encyclopedia.create",
    resource: "encyclopedia",
    resourceId: String(inserted.id),
    meta: { latinName: d.latinName, slug: d.slug },
  });

  revalidatePath("/admin/encyclopedia");
  redirect(`/admin/encyclopedia/${inserted.id}`);
}

// ---------- update ----------
export async function updateEntry(
  id: number,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const raw = Object.fromEntries(formData.entries());
  const parsed = EntryInput.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid input");
  }
  const d = parsed.data;

  const existing = await db.query.encyclopediaEntries.findFirst({
    where: eq(encyclopediaEntries.slug, d.slug),
  });
  if (existing && existing.id !== id) {
    throw new Error(`Slug "${d.slug}" is already used by another entry`);
  }

  await db
    .update(encyclopediaEntries)
    .set({
      slug: d.slug,
      latinName: d.latinName,
      commonName: d.commonName || null,
      family: d.family || null,
      genus: d.genus || null,
      description: d.description || null,
      climateZones: parseCsvArray(d.climateZonesRaw),
      tags: parseTags(d.tagsRaw),
      care: buildCare(formData),
      seasons: buildSeasons(formData),
      companions: parseCsvArray(d.companionsRaw),
      pestNotes: d.pestNotes || null,
      propagation: d.propagation || null,
      landscapeUse: d.landscapeUse || null,
      featured: d.featured,
      status: d.status,
      images: parseImages(d.imagesJson),
      updatedAt: new Date(),
    })
    .where(eq(encyclopediaEntries.id, id));

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "encyclopedia.save",
    resource: "encyclopedia",
    resourceId: String(id),
    meta: { slug: d.slug, status: d.status },
  });

  revalidatePath("/admin/encyclopedia");
  revalidatePath(`/admin/encyclopedia/${id}`);
  revalidatePath("/encyclopedia");
}

// ---------- delete ----------
export async function deleteEntry(id: number): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const entry = await db.query.encyclopediaEntries.findFirst({
    where: eq(encyclopediaEntries.id, id),
  });

  await db.delete(encyclopediaEntries).where(eq(encyclopediaEntries.id, id));

  if (entry) {
    await db.insert(auditLog).values({
      userId: Number(session.user.id),
      action: "encyclopedia.delete",
      resource: "encyclopedia",
      resourceId: String(id),
      meta: { latinName: entry.latinName, slug: entry.slug },
    });
  }

  revalidatePath("/admin/encyclopedia");
  redirect("/admin/encyclopedia");
}
