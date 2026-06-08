"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, plants, auditLog } from "@/lib/db";
import type { PlantCare, PlantSeasons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

// ---------- helpers ----------
function toCents(val: string | null | undefined): number {
  if (!val) return 0;
  return Math.round(parseFloat(val) * 100);
}

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

function parseCompanions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
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
const PlantInput = z.object({
  latinName: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  commonName: z.string().max(200).optional().or(z.literal("")),
  family: z.string().max(100).optional().or(z.literal("")),
  priceDollars: z.string().min(1),
  size: z.string().max(100).optional().or(z.literal("")),
  stockQty: z.preprocess((v) => Number(v), z.number().int().min(0)),
  tagsRaw: z.string().optional().or(z.literal("")),
  shortDescription: z.string().max(1000).optional().or(z.literal("")),
  description: z.string().max(20000).optional().or(z.literal("")),
  companionsRaw: z.string().optional().or(z.literal("")),
  encyclopediaSlug: z.string().max(200).optional().or(z.literal("")),
  featured: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
  status: z.enum(["draft", "live"]),
  imagesJson: z.string().optional().or(z.literal("")),
});

// ---------- create ----------
export async function createPlant(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const raw = Object.fromEntries(formData.entries());
  const parsed = PlantInput.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid input");
  }
  const d = parsed.data;

  const [inserted] = await db
    .insert(plants)
    .values({
      slug: d.slug,
      latinName: d.latinName,
      commonName: d.commonName || null,
      family: d.family || null,
      priceCents: toCents(d.priceDollars),
      size: d.size || null,
      stockQty: d.stockQty,
      tags: parseTags(d.tagsRaw),
      shortDescription: d.shortDescription || null,
      description: d.description || null,
      care: buildCare(formData),
      seasons: buildSeasons(formData),
      companions: parseCompanions(d.companionsRaw),
      encyclopediaSlug: d.encyclopediaSlug || null,
      featured: d.featured,
      status: d.status,
      images: parseImages(d.imagesJson),
    })
    .returning({ id: plants.id });

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "plant.create",
    resource: "plant",
    resourceId: String(inserted.id),
    meta: { latinName: d.latinName, slug: d.slug },
  });

  revalidatePath("/admin/nursery");
  redirect(`/admin/nursery/${inserted.id}`);
}

// ---------- update ----------
export async function updatePlant(
  id: number,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const raw = Object.fromEntries(formData.entries());
  const parsed = PlantInput.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid input");
  }
  const d = parsed.data;

  // Slug uniqueness check
  const existing = await db.query.plants.findFirst({
    where: eq(plants.slug, d.slug),
  });
  if (existing && existing.id !== id) {
    throw new Error(`Slug "${d.slug}" is already used by another plant`);
  }

  await db
    .update(plants)
    .set({
      slug: d.slug,
      latinName: d.latinName,
      commonName: d.commonName || null,
      family: d.family || null,
      priceCents: toCents(d.priceDollars),
      size: d.size || null,
      stockQty: d.stockQty,
      tags: parseTags(d.tagsRaw),
      shortDescription: d.shortDescription || null,
      description: d.description || null,
      care: buildCare(formData),
      seasons: buildSeasons(formData),
      companions: parseCompanions(d.companionsRaw),
      encyclopediaSlug: d.encyclopediaSlug || null,
      featured: d.featured,
      status: d.status,
      images: parseImages(d.imagesJson),
      updatedAt: new Date(),
    })
    .where(eq(plants.id, id));

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "plant.save",
    resource: "plant",
    resourceId: String(id),
    meta: { slug: d.slug, status: d.status },
  });

  revalidatePath("/admin/nursery");
  revalidatePath(`/admin/nursery/${id}`);
  revalidatePath("/nursery");
}

// ---------- delete ----------
export async function deletePlant(id: number): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const plant = await db.query.plants.findFirst({
    where: eq(plants.id, id),
  });

  await db.delete(plants).where(eq(plants.id, id));

  if (plant) {
    await db.insert(auditLog).values({
      userId: Number(session.user.id),
      action: "plant.delete",
      resource: "plant",
      resourceId: String(id),
      meta: { latinName: plant.latinName, slug: plant.slug },
    });
  }

  revalidatePath("/admin/nursery");
  redirect("/admin/nursery");
}
