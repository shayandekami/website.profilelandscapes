import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, products } from "@/lib/db";
import { eq, and, ne } from "drizzle-orm";
import { DefaultProductPage } from "@/components/commerce/defaults/DefaultProductPage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, "live")),
    with: { category: true },
  });
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription || product.description?.slice(0, 160) || undefined,
    openGraph: product.images?.[0]
      ? { images: [{ url: product.images[0].url }] }
      : undefined,
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;

  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, "live")),
    with: { category: true },
  });

  if (!product) notFound();

  // Related products: same category, live, excluding this product, max 4
  const related = product.categoryId
    ? await db.query.products.findMany({
        where: and(
          eq(products.status, "live"),
          eq(products.categoryId, product.categoryId),
          ne(products.id, product.id)
        ),
        with: { category: true },
        limit: 4,
        orderBy: (p, { desc }) => [desc(p.featured)],
      })
    : [];

  return <DefaultProductPage product={product} related={related} />;
}
