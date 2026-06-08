"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, products, productCategories, auditLog } from "@/lib/db";
import { eq, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

// ---------- helpers ----------
function toCents(val: string | null | undefined): number {
  if (!val) return 0;
  return Math.round(parseFloat(val) * 100);
}

function parseImages(raw: string | null | undefined): Array<{ url: string; alt?: string }> {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

// ---------- validation ----------
const ProductInput = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  sku: z.string().max(80).optional().or(z.literal("")),
  categoryId: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().positive().nullable()
  ),
  priceDollars: z.string().min(1),
  compareAtDollars: z.string().optional().or(z.literal("")),
  badge: z.enum(["NEW", "BEST", "SALE", ""]).optional(),
  shortDescription: z.string().max(1000).optional().or(z.literal("")),
  description: z.string().max(20000).optional().or(z.literal("")),
  stockQty: z.preprocess((v) => Number(v), z.number().int().min(0)),
  featured: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
  status: z.enum(["draft", "live"]),
  imagesJson: z.string().optional().or(z.literal("")),
});

const CategoryInput = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  description: z.string().max(1000).optional().or(z.literal("")),
  image: z.string().max(500).optional().or(z.literal("")),
  sortOrder: z.preprocess((v) => Number(v), z.number().int().min(0)).optional(),
  status: z.enum(["draft", "live"]).optional(),
});

// ---------- products ----------
export async function createProduct(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const raw = Object.fromEntries(formData.entries());
  const parsed = ProductInput.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid input");
  }
  const d = parsed.data;

  const [inserted] = await db
    .insert(products)
    .values({
      slug: d.slug,
      name: d.name,
      sku: d.sku || null,
      categoryId: d.categoryId,
      priceCents: toCents(d.priceDollars),
      compareAtCents: d.compareAtDollars ? toCents(d.compareAtDollars) : null,
      badge: d.badge || null,
      shortDescription: d.shortDescription || null,
      description: d.description || null,
      stockQty: d.stockQty,
      featured: d.featured,
      status: d.status,
      images: parseImages(d.imagesJson),
    })
    .returning({ id: products.id });

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "product.create",
    resource: "product",
    resourceId: String(inserted.id),
    meta: { name: d.name, slug: d.slug },
  });

  revalidatePath("/admin/shop");
  redirect(`/admin/shop/${inserted.id}`);
}

export async function updateProduct(
  id: number,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const raw = Object.fromEntries(formData.entries());
  const parsed = ProductInput.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid input");
  }
  const d = parsed.data;

  // Ensure slug unique
  const existing = await db.query.products.findFirst({
    where: eq(products.slug, d.slug),
  });
  if (existing && existing.id !== id) {
    throw new Error(`Slug "${d.slug}" is already used by another product`);
  }

  await db
    .update(products)
    .set({
      slug: d.slug,
      name: d.name,
      sku: d.sku || null,
      categoryId: d.categoryId,
      priceCents: toCents(d.priceDollars),
      compareAtCents: d.compareAtDollars ? toCents(d.compareAtDollars) : null,
      badge: d.badge || null,
      shortDescription: d.shortDescription || null,
      description: d.description || null,
      stockQty: d.stockQty,
      featured: d.featured,
      status: d.status,
      images: parseImages(d.imagesJson),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "product.save",
    resource: "product",
    resourceId: String(id),
    meta: { slug: d.slug, status: d.status },
  });

  revalidatePath("/admin/shop");
  revalidatePath(`/admin/shop/${id}`);
  revalidatePath("/shop");
}

export async function deleteProduct(id: number): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
  });

  await db.delete(products).where(eq(products.id, id));

  if (product) {
    await db.insert(auditLog).values({
      userId: Number(session.user.id),
      action: "product.delete",
      resource: "product",
      resourceId: String(id),
      meta: { name: product.name, slug: product.slug },
    });
  }

  revalidatePath("/admin/shop");
  redirect("/admin/shop");
}

// ---------- categories ----------
export async function createProductCategory(
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const raw = Object.fromEntries(formData.entries());
  const parsed = CategoryInput.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid input");
  }
  const d = parsed.data;

  await db.insert(productCategories).values({
    slug: d.slug,
    name: d.name,
    description: d.description || null,
    image: d.image || null,
    sortOrder: d.sortOrder ?? 0,
    status: d.status ?? "live",
  });

  revalidatePath("/admin/shop");
}

export async function deleteProductCategory(id: number): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  // Reject if products reference this category
  const [{ value: productCount }] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.categoryId, id));

  if (Number(productCount) > 0) {
    throw new Error(
      `Cannot delete — ${productCount} product(s) still reference this category. Re-assign them first.`
    );
  }

  await db.delete(productCategories).where(eq(productCategories.id, id));
  revalidatePath("/admin/shop");
}
