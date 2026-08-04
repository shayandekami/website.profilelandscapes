import fs from "node:fs/promises";
import path from "node:path";

const cataloguePath = path.resolve("lib/db/seed-data/encyclopedia.json");
const catalogue = JSON.parse(await fs.readFile(cataloguePath, "utf8"));
const bySlug = new Map(catalogue.map((entry) => [entry.slug, entry]));

const CITY_DATA_URL = "https://services1.arcgis.com/cNVyNtjGVZybOQWZ/arcgis/rest/services/City_of_Sydney_Tree_Species_List/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&f=json&resultRecordCount=2000";
const CITY_PAGE_URL = "https://www.cityofsydney.nsw.gov.au/lists-maps-inventories/tree-species-list";
const CITY_REFERENCE = {
  title: "Tree species list - urban suitability and selection attributes",
  source: "City of Sydney",
  url: CITY_PAGE_URL,
};

const slugify = (value) => value.toLowerCase()
  .replace(/[×'’".()]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const clean = (value) => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value;
const unique = (values) => [...new Set(values.filter(Boolean))];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function scientificName(row) {
  const genus = clean(row.Genus);
  const species = clean(row.Species);
  const variety = clean(row.Variety);
  if (!genus || !species || /^(sp\.?|species)$/i.test(species)) return null;
  return [genus, species, variety].filter(Boolean).join(" ").replace(/\s+/g, " ");
}

function councilDescription(row, name) {
  const common = clean(row.CommonName) || name;
  const origin = clean(row.Origin)?.toLowerCase() || "listed";
  const height = row.NominalHeight ? `${row.NominalHeight} m high` : "a site-dependent mature height";
  const spread = row.NominalSpread ? `${row.NominalSpread} m spread` : "a site-dependent spread";
  const shape = clean(row.F_Shape)?.toLowerCase();
  const amenity = clean(row.SpecialAmenityValue)?.toLowerCase();
  const reliability = clean(row.Reliability)?.toLowerCase();
  const parts = [
    `${common} (${name}) is a ${origin} tree included in the City of Sydney tree species list.`,
    `Council data indicates approximately ${height} and ${spread}${shape ? `, with a ${shape} canopy form` : ""}.`,
    amenity ? `Its noted amenity value is ${amenity}.` : null,
    reliability ? `Its recorded local performance is ${reliability}.` : null,
    "Final selection should still account for available soil volume, services, exposure and the mature canopy required on the site.",
  ];
  return parts.filter(Boolean).join(" ");
}

function tagsFor(row) {
  const origin = clean(row.Origin)?.toLowerCase() || "";
  return unique([
    "TREE",
    "COUNCIL_RECOMMENDED",
    origin.includes("native") || origin.includes("indigenous") ? "NATIVE" : null,
    origin.includes("locally indigenous") ? "INDIGENOUS_SYDNEY" : null,
    clean(row.VulnerableToDrought)?.toLowerCase() === "no" ? "DROUGHT" : null,
  ]);
}

function careFor(row) {
  const moisture = clean(row.SoilMoisture);
  const exposure = clean(row.Exposure);
  return {
    soil: moisture ? `${moisture} soil; confirm drainage and soil volume for the site` : "Site-appropriate soil with adequate rooting volume",
    light: clean(row.Light) || exposure || "Full sun to part shade, subject to species",
    water: clean(row.VulnerableToDrought)?.toLowerCase() === "yes"
      ? "Regular water during heat and extended dry periods"
      : "Establishment watering; monitor during extended drought",
    growthRate: clean(row.GrowthRate) || "Moderate",
    matureSize: `${row.NominalHeight || "Variable"} m H × ${row.NominalSpread || "Variable"} m W`,
  };
}

async function licensedPhoto(name) {
  const endpoint = new URL("https://api.inaturalist.org/v1/observations");
  endpoint.search = new URLSearchParams({
    taxon_name: name,
    photos: "true",
    quality_grade: "research",
    photo_license: "cc0,cc-by,cc-by-sa",
    per_page: "20",
    order_by: "votes",
  });
  try {
    const response = await fetch(endpoint, { headers: { "User-Agent": "Profile Landscapes council catalogue import" } });
    if (!response.ok) return null;
    const body = await response.json();
    for (const observation of body.results ?? []) {
      const observedName = observation.taxon?.name?.toLowerCase();
      const target = name.toLowerCase();
      if (observedName !== target && !target.startsWith(`${observedName} `)) continue;
      const photo = observation.photos?.find((item) => ["cc0", "cc-by", "cc-by-sa"].includes(item.license_code));
      if (!photo?.url) continue;
      return {
        image: {
          alt: `${name} - council-listed tree`,
          url: photo.url.replace(/\/square\.(jpe?g|png)$/i, "/large.$1"),
        },
        reference: {
          title: `${name} verified observation photograph`,
          source: `iNaturalist · ${photo.attribution || photo.license_code}`,
          url: `https://www.inaturalist.org/photos/${photo.id}`,
        },
      };
    }
  } catch {}
  return null;
}

const response = await fetch(CITY_DATA_URL);
if (!response.ok) throw new Error(`City of Sydney dataset returned ${response.status}`);
const cityData = await response.json();
const rows = (cityData.features ?? []).map((feature) => feature.attributes);

let added = 0;
let enriched = 0;
let photographed = 0;
let placeholders = 0;

for (let index = 0; index < rows.length; index++) {
  const row = rows[index];
  const name = scientificName(row);
  if (!name) continue;
  const slug = slugify(name);
  const existing = bySlug.get(slug)
    ?? catalogue.find((entry) => entry.latin_name.toLowerCase() === name.toLowerCase());
  const baseTags = tagsFor(row);
  const reference = { ...CITY_REFERENCE };

  if (existing) {
    existing.tags = unique([...(existing.tags ?? []), ...baseTags]);
    existing.references = [
      ...(existing.references ?? []).filter((item) => item.source !== "City of Sydney"),
      reference,
    ];
    if (!existing.landscape_use) {
      existing.landscape_use = clean(row.RecommendedUsageGeneralLocation)
        || `Council-listed ${clean(row.F_Shape)?.toLowerCase() || "urban"} tree`;
    }
    if (!existing.description || existing.description.length < 120) {
      existing.description = councilDescription(row, name);
    }
    if (!existing.images?.some((image) => image?.url)) {
      const photo = await licensedPhoto(name);
      if (photo) {
        existing.images = [photo.image];
        existing.references.push(photo.reference);
        photographed++;
      }
    }
    enriched++;
    continue;
  }

  const photo = await licensedPhoto(name);
  if (photo) photographed++;
  else placeholders++;
  const entry = {
    slug,
    latin_name: name,
    common_name: clean(row.CommonName) || "",
    family: clean(row.Family) || "",
    genus: clean(row.Genus) || name.split(" ")[0],
    description: councilDescription(row, name),
    climate_zones: ["temperate", "subtropical", "urban"],
    tags: baseTags,
    care: careFor(row),
    seasons: null,
    companions: [],
    images: photo ? [photo.image] : [],
    cultivars: [],
    landscape_use: clean(row.RecommendedUsageGeneralLocation)
      || `Council-listed ${clean(row.F_Shape)?.toLowerCase() || "urban"} tree`,
    references: unique([reference, photo?.reference]),
  };
  catalogue.push(entry);
  bySlug.set(slug, entry);
  added++;
  if (index % 12 === 0) await sleep(150);
}

catalogue.sort((a, b) => a.latin_name.localeCompare(b.latin_name));
await fs.writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`);
console.log(JSON.stringify({
  councilRows: rows.length,
  catalogueEntries: catalogue.length,
  added,
  enriched,
  photographed,
  placeholders,
}, null, 2));
