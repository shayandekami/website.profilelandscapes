import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productCategories } from "@/lib/db/schema";
import { eq, and, ilike } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const featured = searchParams.get("featured");
    const q = searchParams.get("q");

    // Fetch all live categories upfront
    const allCategories = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.status, "live"))
      .orderBy(productCategories.sortOrder);

    // Build product query with join
    const rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        sku: products.sku,
        name: products.name,
        categoryId: products.categoryId,
        priceCents: products.priceCents,
        compareAtCents: products.compareAtCents,
        badge: products.badge,
        description: products.description,
        shortDescription: products.shortDescription,
        images: products.images,
        stockQty: products.stockQty,
        featured: products.featured,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryName: productCategories.name,
        categorySlug: productCategories.slug,
      })
      .from(products)
      .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
      .where(
        and(
          eq(products.status, "live"),
          categorySlug
            ? eq(productCategories.slug, categorySlug)
            : undefined,
          featured === "1" ? eq(products.featured, true) : undefined,
          q ? ilike(products.name, `%${q}%`) : undefined
        )
      )
      .orderBy(products.createdAt);

    return NextResponse.json({ products: rows, categories: allCategories });
  } catch (err) {
    console.error("[GET /api/shop/products]", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
