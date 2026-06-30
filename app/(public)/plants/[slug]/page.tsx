import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, plants } from "@/lib/db";
import { eq, and, inArray } from "drizzle-orm";
import { DefaultPlantPage } from "@/components/commerce/defaults/DefaultPlantPage";
import { theme } from "@/themes/active";
import { JsonLd, productLd, breadcrumbLd } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const plant = await db
    .select()
    .from(plants)
    .where(and(eq(plants.slug, slug), eq(plants.status, "live")))
    .limit(1)
    .then((r) => r[0]);

  if (!plant) return {};
  return {
    title: plant.commonName
      ? `${plant.commonName} (${plant.latinName})`
      : plant.latinName,
    description: plant.shortDescription || plant.description?.slice(0, 160) || undefined,
    openGraph: plant.images?.[0]
      ? { images: [{ url: plant.images[0].url }] }
      : undefined,
  };
}

export default async function PlantDetailPage({ params }: Params) {
  const { slug } = await params;

  const plant = await db
    .select()
    .from(plants)
    .where(and(eq(plants.slug, slug), eq(plants.status, "live")))
    .limit(1)
    .then((r) => r[0]);

  if (!plant) notFound();

  // Companion plants: look up by slugs stored in plant.companions[]
  const companions =
    plant.companions.length > 0
      ? await db
          .select()
          .from(plants)
          .where(
            and(
              eq(plants.status, "live"),
              inArray(plants.slug, plant.companions)
            )
          )
      : [];

  const PlantPage = theme.nursery?.PlantPage ?? DefaultPlantPage;
  const img = (plant.images as Array<{ url: string }>)?.[0]?.url;

  return (
    <>
      <JsonLd data={productLd({
        name: plant.commonName ? `${plant.commonName} (${plant.latinName})` : plant.latinName,
        description: plant.shortDescription || plant.description,
        image: img,
        url: `/plants/${plant.slug}`,
        priceCents: plant.priceCents,
        inStock: (plant.stockQty ?? 0) > 0,
      })} />
      <JsonLd data={breadcrumbLd([
        { name: "Nursery", url: "/plants" },
        { name: plant.commonName || plant.latinName, url: `/plants/${plant.slug}` },
      ])} />
      <PlantPage plant={plant} companions={companions} />
    </>
  );
}
