import fs from "node:fs/promises";
import path from "node:path";

const cataloguePath = path.resolve("lib/db/seed-data/encyclopedia.json");
const councilPath = path.resolve("lib/db/seed-data/council-inner-west.json");
const catalogue = JSON.parse(await fs.readFile(cataloguePath, "utf8"));
const councilPlants = JSON.parse(await fs.readFile(councilPath, "utf8"));
const byName = new Map(catalogue.map((entry) => [entry.latin_name.toLowerCase(), entry]));

const SOURCE_URL = "https://www.innerwest.nsw.gov.au/sites/default/files/2026-02/Native%20Plants%20of%20the%20Inner%20West%20list%20FINAL%20181120%20%2810%29.pdf";
const SOURCE_PAGE = "https://www.innerwest.nsw.gov.au/trees-gardens-and-wildlife/creating-nature-home";
const unique = (values) => [...new Set(values.filter(Boolean))];
const slugify = (value) => value.toLowerCase().replace(/[×'’".()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const sunlight = (code) => ({
  FS: "Full sun",
  PS: "Part shade or dappled light",
  S: "Shade",
})[code] || code.replace("FS", "full sun").replace("PS", "part shade").replace("S", "shade");

const watering = (code) => ({
  LW: "Low water; tolerates dry soil and drought periods",
  MW: "Moderate water; prefers moist soil",
  HW: "Tolerates wet soil and occasional waterlogging",
})[code] || code || "Establishment watering, then according to site conditions";

const zones = {
  SSFW: "Sandstone Slopes Forest and Woodland",
  STIF: "Sydney Turpentine-Ironbark Forest",
  WC: "Inner West Wetland Complex",
};

async function licensedPhoto(name) {
  const endpoint = new URL("https://api.inaturalist.org/v1/observations");
  endpoint.search = new URLSearchParams({
    taxon_name: name, photos: "true", quality_grade: "research",
    photo_license: "cc0,cc-by,cc-by-sa", per_page: "20", order_by: "votes",
  });
  try {
    const response = await fetch(endpoint, { headers: { "User-Agent": "Profile Landscapes Inner West catalogue import" } });
    const body = response.ok ? await response.json() : { results: [] };
    for (const observation of body.results ?? []) {
      if (observation.taxon?.name?.toLowerCase() !== name.toLowerCase()) continue;
      const photo = observation.photos?.find((item) => ["cc0", "cc-by", "cc-by-sa"].includes(item.license_code));
      if (!photo?.url) continue;
      return {
        image: { alt: `${name} - Inner West indigenous plant`, url: photo.url.replace(/\/square\.(jpe?g|png)$/i, "/large.$1") },
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

let added = 0;
let enriched = 0;
let photos = 0;

for (const row of councilPlants) {
  const name = row.scientific_name;
  const vegetationNames = row.vegetation_zones.map((zone) => zones[zone] || zone);
  const tags = unique([
    "NATIVE", "INDIGENOUS_SYDNEY", "COUNCIL_RECOMMENDED", "INNER_WEST",
    row.water === "LW" ? "DROUGHT" : null,
    row.type ? "TREE" : null,
    ...row.vegetation_zones,
  ]);
  const councilReference = {
    title: `Native Plants of the Inner West - page ${row.source_page}`,
    source: "Inner West Council",
    url: SOURCE_URL,
  };
  const existing = byName.get(name.toLowerCase());
  if (existing) {
    existing.tags = unique([...(existing.tags ?? []), ...tags]);
    existing.references = [
      ...(existing.references ?? []).filter((reference) => reference.source !== "Inner West Council"),
      councilReference,
    ];
    if ((!existing.description || existing.description.length < 140) && row.description) {
      existing.description = `${row.description} Inner West Council identifies this species for ${vegetationNames.join(", ")} planting contexts.`;
    }
    if (!existing.landscape_use) {
      existing.landscape_use = `Locally indigenous habitat planting for ${vegetationNames.join(", ")} conditions.`;
    }
    enriched++;
    continue;
  }
  const photo = await licensedPhoto(name);
  if (photo) photos++;
  const entry = {
    slug: slugify(name),
    latin_name: name,
    common_name: row.common_name,
    family: "",
    genus: name.split(" ")[0],
    description: `${row.description} Inner West Council identifies this locally indigenous species for ${vegetationNames.join(", ")} planting contexts.`,
    climate_zones: ["temperate", "subtropical", "Sydney Inner West"],
    tags,
    care: {
      soil: row.soil || "Match the local vegetation community and site drainage",
      light: sunlight(row.sun),
      water: watering(row.water),
      growthRate: "Site dependent",
      matureSize: row.height || "Refer to council guidance",
    },
    seasons: null,
    companions: [],
    images: photo ? [photo.image] : [],
    cultivars: [],
    landscape_use: `Locally indigenous habitat planting for ${vegetationNames.join(", ")} conditions.`,
    references: [councilReference, ...(photo ? [photo.reference] : []), {
      title: "Creating Nature at Home",
      source: "Inner West Council",
      url: SOURCE_PAGE,
    }],
  };
  catalogue.push(entry);
  byName.set(name.toLowerCase(), entry);
  added++;
}

catalogue.sort((a, b) => a.latin_name.localeCompare(b.latin_name));
await fs.writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`);
console.log(JSON.stringify({ councilRows: councilPlants.length, catalogueEntries: catalogue.length, added, enriched, photos }, null, 2));
