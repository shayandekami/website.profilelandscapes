/**
 * JSON-LD structured data. Server-rendered <script type="application/ld+json">.
 * Improves search rich results (org knowledge panel, product cards, breadcrumbs).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export function organizationLd(settings: { studio_name?: string; phone?: string; email?: string; address?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "LandscapeService",
    name: settings.studio_name || "Profile Landscapes",
    url: SITE,
    image: `${SITE}/assets/logo.png`,
    telephone: settings.phone,
    email: settings.email,
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressRegion: "NSW", addressCountry: "AU" },
    areaServed: "Sydney, NSW",
    foundingDate: "1999",
  };
}

export function productLd(opts: {
  name: string;
  description?: string | null;
  image?: string;
  url: string;
  priceCents: number;
  inStock: boolean;
  brand?: string;
  ratingValue?: number;
  reviewCount?: number;
}) {
  const d: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description || undefined,
    image: opts.image ? [opts.image] : undefined,
    brand: { "@type": "Brand", name: opts.brand || "Profile Landscapes" },
    offers: {
      "@type": "Offer",
      url: `${SITE}${opts.url}`,
      priceCurrency: "AUD",
      price: (opts.priceCents / 100).toFixed(2),
      availability: opts.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    },
  };
  if (opts.ratingValue && opts.reviewCount) {
    d.aggregateRating = { "@type": "AggregateRating", ratingValue: opts.ratingValue, reviewCount: opts.reviewCount };
  }
  return d;
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.url}`,
    })),
  };
}
