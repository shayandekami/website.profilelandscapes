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

/**
 * Split a one-line address into the parts Google actually reads.
 * "16 New Canterbury Road, Petersham NSW 2049" ->
 *   street "16 New Canterbury Road", locality "Petersham", region "NSW", postcode "2049"
 * Falls back to putting everything in streetAddress if the shape is unfamiliar.
 */
function splitAddress(addr?: string) {
  const base = { "@type": "PostalAddress", streetAddress: addr, addressRegion: "NSW", addressCountry: "AU" } as Record<string, unknown>;
  if (!addr) return base;
  const m = addr.match(/^(.*?),\s*([A-Za-z\s']+?)\s+([A-Z]{2,3})\s*(\d{4})\s*$/);
  if (!m) return base;
  return {
    "@type": "PostalAddress",
    streetAddress: m[1].trim(),
    addressLocality: m[2].trim(),
    addressRegion: m[3].trim(),
    postalCode: m[4].trim(),
    addressCountry: "AU",
  };
}

export function organizationLd(settings: {
  studio_name?: string; phone?: string; email?: string; address?: string;
  abn?: string; social_linkedin?: string; social_facebook?: string;
  social_instagram?: string; profile_urls?: string;
}) {
  // sameAs is how Google links this site to the SAME real-world business listed
  // elsewhere. It matters here because an UNRELATED company owns the .com and
  // ranks for the same brand name — these links are the disambiguation signal.
  const sameAs = [
    settings.social_linkedin,
    settings.social_facebook,
    settings.social_instagram,
    ...(settings.profile_urls || "").split(/[\s,]+/).filter(Boolean),
  ].filter((u): u is string => Boolean(u && /^https?:\/\//.test(u)));

  const d: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LandscapeService", "GeneralContractor"],
    "@id": `${SITE}/#organization`,           // stable id so other nodes can reference it
    name: settings.studio_name || "Profile Landscapes",
    url: SITE,
    image: `${SITE}/assets/logo.png`,
    logo: `${SITE}/assets/logo.png`,
    telephone: settings.phone,
    email: settings.email,
    address: splitAddress(settings.address),
    areaServed: [
      { "@type": "City", name: "Sydney" },
      { "@type": "State", name: "New South Wales" },
    ],
    foundingDate: "1999",
    knowsAbout: [
      "commercial landscape construction",
      "landscape design",
      "softworks and planting",
      "landscape maintenance",
      "wholesale nursery supply",
    ],
  };
  if (sameAs.length) d.sameAs = sameAs;
  if (settings.abn) d.identifier = { "@type": "PropertyValue", propertyID: "ABN", value: settings.abn };
  return d;
}

/**
 * WebSite node. The SearchAction is what makes Google offer a search box under
 * the result for brand queries; the publisher link ties every page back to the
 * organisation node above.
 */
export function websiteLd(settings: { studio_name?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: SITE,
    name: settings.studio_name || "Profile Landscapes",
    publisher: { "@id": `${SITE}/#organization` },
    inLanguage: "en-AU",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE}/plants?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
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
