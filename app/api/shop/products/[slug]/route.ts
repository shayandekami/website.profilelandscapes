import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productCategories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [row] = await db
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
        categoryDescription: productCategories.description,
      })
      .from(products)
      .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
      .where(
        and(eq(products.slug, slug), eq(products.status, "live"))
      )
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: row });
  } catch (err) {
    console.error("[GET /api/shop/products/[slug]]", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
