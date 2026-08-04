import fs from "node:fs/promises";
import path from "node:path";

const cataloguePath = path.resolve("lib/db/seed-data/encyclopedia.json");
const catalogue = JSON.parse(await fs.readFile(cataloguePath, "utf8"));
const byLatin = new Map(catalogue.map((entry) => [entry.latin_name.toLowerCase(), entry]));
const byCommon = new Map(catalogue.filter((entry) => entry.common_name).map((entry) => [entry.common_name.toLowerCase(), entry]));
const normaliseCommon = (value) => value.toLowerCase()
  .replace(/\b(coastal|common|native|australian)\b/g, "")
  .replace(/[^a-z0-9]+/g, "")
  .replace(/flowered/g, "flower");
const byNormalCommon = new Map(catalogue.filter((entry) => entry.common_name).map((entry) => [normaliseCommon(entry.common_name), entry]));
const unique = (values) => [...new Set(values.filter(Boolean))];
const text = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();
const slugify = (value) => value.toLowerCase().replace(/[×'’".()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const councils = {
  northernBeaches: {
    source: "Northern Beaches Council",
    title: "Backyard Habitat species guide",
    url: "https://www.northernbeaches.nsw.gov.au/environment/backyard-habitat/native-plants-your-home/backyard-habitat-species-guide",
    tag: "NORTHERN_BEACHES",
  },
  ryde: {
    source: "City of Ryde Council",
    title: "Tree planting and selection lists",
    url: "https://www.ryde.nsw.gov.au/Environment-and-Waste/Trees/Tree-Selection-and-Establishment/Tree-Planting-Lists",
    tag: "CITY_OF_RYDE",
  },
  laneCove: {
    source: "Lane Cove Council",
    title: "Council indigenous tree species list",
    url: "https://ecouncil.lanecove.nsw.gov.au/TRIM/documents_TE/903528459/TRIM_Annexure%2010%20-%20Arborist%20Report_1724388.PDF",
    tag: "LANE_COVE",
  },
};

const aliases = new Map([
  ["syzigium leuhmannii", "syzygium luehmannii"],
  ["melaleuca linarifolia", "melaleuca linariifolia"],
  ["acmena smithii", "syzygium smithii"],
  ["themeda australis", "themeda triandra"],
  ["kennedia rubicundra", "kennedia rubicunda"],
  ["oplismenus sp.", "oplismenus aemulus"],
]);

function findEntry(latin, common) {
  const key = aliases.get(latin.toLowerCase()) || latin.toLowerCase();
  return byLatin.get(key) || byCommon.get(common.toLowerCase()) || byNormalCommon.get(normaliseCommon(common));
}

function addCouncil(entry, council, title = council.title, url = council.url) {
  entry.tags = unique([...(entry.tags || []), "NATIVE", "INDIGENOUS_SYDNEY", "COUNCIL_RECOMMENDED", council.tag]);
  entry.references = [
    ...(entry.references || []).filter((reference) => reference.source !== council.source),
    { title, source: council.source, url },
  ];
}

async function photoFor(latin) {
  try {
    const endpoint = new URL("https://api.inaturalist.org/v1/observations");
    endpoint.search = new URLSearchParams({
      taxon_name: latin, photos: "true", quality_grade: "research",
      photo_license: "cc0,cc-by,cc-by-sa", per_page: "20", order_by: "votes",
    });
    const response = await fetch(endpoint, { headers: { "User-Agent": "Profile Landscapes council plant guide importer" } });
    const data = response.ok ? await response.json() : { results: [] };
    for (const observation of data.results || []) {
      if (observation.taxon?.name?.toLowerCase() !== latin.toLowerCase()) continue;
      const photo = observation.photos?.find((item) => ["cc0", "cc-by", "cc-by-sa"].includes(item.license_code));
      if (!photo?.url) continue;
      return {
        image: { alt: `${latin} botanical reference`, url: photo.url.replace(/\/square\.(jpe?g|png)$/i, "/large.$1") },
        reference: {
          title: `${latin} verified observation photograph`,
          source: `iNaturalist · ${photo.attribution || photo.license_code}`,
          url: `https://www.inaturalist.org/photos/${photo.id}`,
        },
      };
    }
  } catch {}
  return null;
}

async function createEntry(latin, common, note, council) {
  const photo = await photoFor(latin);
  const entry = {
    slug: slugify(latin),
    latin_name: latin,
    common_name: common,
    family: "",
    genus: latin.split(" ")[0],
    description: `${common} (${latin}) is included in ${council.source}'s published planting guidance. ${note}`.trim(),
    climate_zones: ["temperate", "Sydney"],
    tags: ["NATIVE", "INDIGENOUS_SYDNEY", "COUNCIL_RECOMMENDED", council.tag],
    care: {
      soil: "Confirm local soil, drainage and exposure against the linked council guidance",
      light: "Site dependent",
      water: "Water through establishment; then according to species and site",
      growthRate: "Species dependent",
      matureSize: "Refer to council guidance",
    },
    seasons: null,
    companions: [],
    images: photo ? [photo.image] : [],
    cultivars: [],
    landscape_use: note || "Council-referenced planting for Sydney landscapes.",
    references: [{ title: council.title, source: council.source, url: council.url }, ...(photo ? [photo.reference] : [])],
  };
  catalogue.push(entry);
  byLatin.set(latin.toLowerCase(), entry);
  if (common) byCommon.set(common.toLowerCase(), entry);
  if (common) byNormalCommon.set(normaliseCommon(common), entry);
  return entry;
}

let enriched = 0;
let added = 0;
const counts = {};

// Northern Beaches publishes individual profiles for 66 backyard-habitat plants.
{
  const council = councils.northernBeaches;
  const base = "https://www.northernbeaches.nsw.gov.au";
  const html = await (await fetch(council.url)).text();
  const cards = [...html.matchAll(/href="(\/environment\/species\/[^"]+)"[\s\S]{0,1400}?<span>([^<]+)<\/span>/gi)];
  const rows = [...new Map(cards.map((match) => [match[1], text(match[2])])).entries()];
  let count = 0;
  for (const [href, common] of rows) {
    if (href.endsWith("/species-guide")) continue;
    const detailUrl = `${base}${href}`;
    const detailHtml = await (await fetch(detailUrl)).text();
    const marker = detailHtml.match(/block-system-main-block">\s*([^<]+?)\s*<div class="paragraphs page-components"/i);
    let latin = text(marker?.[1] || "");
    if (!latin || !/^[A-Z][a-z]+(?:\s+[a-z][a-z.-]+){1,2}$/.test(latin)) {
      const existing = byCommon.get(common.toLowerCase()) || byNormalCommon.get(normaliseCommon(common));
      latin = existing?.latin_name || "";
    }
    if (!latin) continue;
    let entry = findEntry(latin, common);
    if (!entry) {
      entry = await createEntry(
        latin, common,
        "Selected for backyard habitat planting, with council advice on preferred soil, position, growth and flowering.",
        council,
      );
      added++;
    }
    addCouncil(entry, council, `${common} - Backyard Habitat species profile`, detailUrl);
    enriched++;
    count++;
  }
  counts[council.source] = count;
}

// Ryde's live table provides common names, botanical names, size class and selection notes.
{
  const council = councils.ryde;
  const html = await (await fetch(council.url)).text();
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((match) => [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => text(cell[1])))
    .filter((cells) => cells.length >= 3 && /^[A-Z][a-z]+(?:\s+[a-zA-Z][a-zA-Z'.-]+)+/.test(cells[1] || ""));
  let count = 0;
  for (const [common, rawLatin, size, note] of rows) {
    const latin = rawLatin.replace(/\s+/g, " ").trim();
    let entry = findEntry(latin, common);
    if (!entry) {
      entry = await createEntry(latin, common, `${note || "Council tree selection."} Council size class: ${size}.`, council);
      added++;
    } else {
      enriched++;
    }
    addCouncil(entry, council);
    count++;
  }
  counts[council.source] = count;
}

// Lane Cove's published arborist documentation reproduces its indigenous tree list.
{
  const council = councils.laneCove;
  const species = [
    ["Acacia implexa", "Hickory Wattle"], ["Acacia parramattensis", "Parramatta Wattle"],
    ["Syzygium smithii", "Common Lilly Pilly"], ["Allocasuarina torulosa", "Forest Oak"],
    ["Angophora floribunda", "Rough-barked Apple"], ["Backhousia myrtifolia", "Grey Myrtle"],
    ["Banksia serrata", "Old Man Banksia"], ["Banksia integrifolia", "Coast Banksia"],
    ["Corymbia gummifera", "Red Bloodwood"], ["Glochidion ferdinandi", "Cheese Tree"],
    ["Melaleuca linariifolia", "Snow-in-Summer"], ["Syncarpia glomulifera", "Turpentine"],
    ["Tristaniopsis laurina", "Water Gum"],
  ];
  for (const [latin, common] of species) {
    let entry = findEntry(latin, common);
    if (!entry) {
      entry = await createEntry(latin, common, "Included in Lane Cove Council's indigenous tree selection.", council);
      added++;
    } else {
      enriched++;
    }
    addCouncil(entry, council);
  }
  counts[council.source] = species.length;
}

catalogue.sort((a, b) => a.latin_name.localeCompare(b.latin_name));
await fs.writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`);
console.log(JSON.stringify({ total: catalogue.length, added, enriched, councilProfiles: counts }, null, 2));
