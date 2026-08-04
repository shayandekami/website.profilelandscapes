import type { Metadata } from "next";
import { db, products, productCategories } from "@/lib/db";
import { eq, and, ilike, or } from "drizzle-orm";
import { DefaultShopPage } from "@/components/commerce/defaults/DefaultShopPage";
import { theme } from "@/themes/active";
import { getSiteSettings } from "@/lib/content";
import { FeatureUnavailable } from "@/components/commerce/FeatureUnavailable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our full range of products.",
};

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const settings = await getSiteSettings();
  if (!settings.commerce_features.shop) {
    return <FeatureUnavailable eyebrow="Online shop" title="The shop is currently offline." body="Our team is updating the range. Contact us for product availability or return soon." />;
  }
  const { category: categorySlug, q: searchQuery } = await searchParams;

  // Load all live categories
  const categories = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.status, "live"))
    .orderBy(productCategories.sortOrder);

  // Resolve selected category id
  const selectedCat = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  // Build product query conditions
  const conditions = [eq(products.status, "live")];

  if (selectedCat) {
    conditions.push(eq(products.categoryId, selectedCat.id));
  }

  if (searchQuery && searchQuery.trim()) {
    conditions.push(
      or(
        ilike(products.name, `%${searchQuery.trim()}%`),
        ilike(products.sku, `%${searchQuery.trim()}%`)
      )!
    );
  }

  const productList = await db.query.products.findMany({
    where: and(...conditions),
    with: { category: true },
    orderBy: (p, { desc }) => [desc(p.featured), p.name],
  });

  const ShopPage = theme.commerce?.ShopPage ?? DefaultShopPage;

  return (
    <ShopPage
      products={productList}
      categories={categories}
      selectedCategory={categorySlug}
      searchQuery={searchQuery}
    />
  );
}
