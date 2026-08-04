import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const cataloguePath = path.resolve("lib/db/seed-data/encyclopedia.json");
const catalogue = JSON.parse(await fs.readFile(cataloguePath, "utf8"));
const previousCatalogue = JSON.parse(execFileSync("git", ["show", "HEAD:lib/db/seed-data/encyclopedia.json"], { encoding: "utf8" }));
const previousBySlug = new Map(previousCatalogue.map((entry) => [entry.slug, entry]));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const source = {
  title: "Species profile and accepted Australian name",
  source: "Atlas of Living Australia / Australian Plant Census",
  url: "https://bie.ala.org.au/",
};

const commonsSource = (name) => ({
  title: `${name} image search and attribution`,
  source: "Wikimedia Commons",
  url: `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(name)}&title=Special:MediaSearch&type=image`,
});
const alaImageSource = (name) => ({
  title: `${name} taxon photograph`,
  source: "Atlas of Living Australia image service",
  url: `https://bie.ala.org.au/search?q=${encodeURIComponent(name)}`,
});

const profiles = [
  ["Actinotus helianthi", "Flannel Flower", "Apiaceae", "feature perennial", "0.5–1 m H × 0.5 m W", "Full sun to light shade", "Free-draining sandy soil", "Moderate; lower once established", ["NATIVE", "COASTAL"], "Soft silver foliage and velvety white flower heads give this Sydney sandstone native a distinctive, refined character. Best used in naturalistic drifts, rock gardens and containers where drainage is excellent."],
  ["Alpinia caerulea", "Native Ginger", "Zingiberaceae", "screening perennial", "1.5–3 m H × 1–2 m W", "Part shade to shade", "Moist, humus-rich soil", "Moderate", ["NATIVE", "SHADE"], "A lush east-coast rainforest plant with broad leaves, white flowers and blue fruit. It brings a convincing subtropical layer to shaded courtyards, understorey gardens and sheltered commercial landscapes."],
  ["Alyxia ruscifolia", "Chain Fruit", "Apocynaceae", "understorey shrub", "1–2.5 m H × 1.5 m W", "Part shade", "Moist, well-drained soil", "Moderate", ["NATIVE", "SHADE"], "A compact rainforest shrub with glossy leaves, fragrant white flowers and orange chain-like fruit. Useful for protected Sydney gardens where a polished evergreen understorey is required."],
  ["Angophora hispida", "Dwarf Apple", "Myrtaceae", "habitat shrub", "2–7 m H × 3–5 m W", "Full sun", "Sandy, free-draining soil", "Low once established", ["NATIVE", "DROUGHT"], "A characterful sandstone shrub or small tree with rough bark, broad juvenile foliage and white summer flowers. It is valuable in habitat gardens and informal native screening on dry sites."],
  ["Anigozanthos flavidus", "Tall Kangaroo Paw", "Haemodoraceae", "feature perennial", "1–2 m flowering H × 0.8 m W", "Full sun", "Free-draining sandy loam", "Low to moderate", ["NATIVE", "DROUGHT"], "The robust kangaroo paw species, producing tall bird-attracting flower stems and strappy evergreen foliage. It performs more reliably on the humid east coast than many compact hybrids."],
  ["Austromyrtus dulcis", "Midgen Berry", "Myrtaceae", "edible groundcover", "0.3–0.8 m H × 1–2 m W", "Full sun to part shade", "Well-drained sandy soil", "Moderate", ["NATIVE", "EDIBLE", "COASTAL"], "A low spreading coastal shrub with pink new growth and sweet, speckled edible berries. It works as a refined native groundcover in productive gardens and coastal planting palettes."],
  ["Banksia marginata", "Silver Banksia", "Proteaceae", "habitat tree", "2–10 m H × 2–5 m W", "Full sun", "Well-drained low-phosphorus soil", "Low once established", ["NATIVE", "DROUGHT"], "A highly variable small tree or shrub with silver leaf undersides and yellow flower spikes. It is a durable habitat plant suited to naturalistic screens, revegetation and low-water gardens."],
  ["Banksia paludosa", "Swamp Banksia", "Proteaceae", "habitat shrub", "1–2 m H × 1.5 m W", "Full sun", "Moist sandy soil", "Moderate", ["NATIVE"], "A compact eastern Australian banksia with rusty new flower spikes ageing to yellow. It is a strong choice for damp heath-style gardens and sites that remain moist without becoming stagnant."],
  ["Banksia spinulosa", "Hairpin Banksia", "Proteaceae", "feature shrub", "1–3 m H × 1–3 m W", "Full sun to part shade", "Well-drained low-phosphorus soil", "Low once established", ["NATIVE", "DROUGHT"], "Dense evergreen foliage and upright golden flower spikes make this one of the most useful smaller banksias. It supports birds and pollinators while fitting comfortably into residential gardens."],
  ["Bauera rubioides", "River Rose", "Cunoniaceae", "riparian shrub", "0.5–2 m H × 1.5 m W", "Part shade", "Moist acidic soil", "Moderate to high", ["NATIVE", "SHADE"], "A fine-textured shrub with small pink or white flowers, naturally associated with creeks and damp forest margins. Use it beside water, in rain gardens or as a soft shaded understorey."],
  ["Brachychiton acerifolius", "Illawarra Flame Tree", "Malvaceae", "feature tree", "10–20 m H × 6–12 m W", "Full sun", "Deep, well-drained soil", "Moderate", ["NATIVE", "FEATURE"], "A spectacular east-coast canopy tree known for brilliant red flowering on bare branches. It needs generous space and is best reserved for parks, large gardens and landmark commercial landscapes."],
  ["Brachychiton populneus", "Kurrajong", "Malvaceae", "shade tree", "8–15 m H × 5–10 m W", "Full sun", "Well-drained soil", "Low once established", ["NATIVE", "DROUGHT"], "A resilient small to medium tree with a dense crown and swollen water-storing trunk. Kurrajong tolerates heat and dry conditions and is valuable for shade in larger low-water landscapes."],
  ["Callicoma serratifolia", "Black Wattle", "Cunoniaceae", "screening tree", "5–10 m H × 3–6 m W", "Part shade", "Moist, well-drained soil", "Moderate", ["NATIVE", "SHADE"], "A handsome Sydney-region rainforest-edge tree with serrated glossy foliage and cream flower heads. It makes a useful informal screen or creek-line tree in sheltered, moisture-retentive sites."],
  ["Callitris rhomboidea", "Port Jackson Pine", "Cupressaceae", "structural tree", "8–15 m H × 3–6 m W", "Full sun", "Well-drained sandy soil", "Low once established", ["NATIVE", "DROUGHT", "COASTAL"], "A slender native conifer with fine dark foliage and strong vertical form. It brings year-round structure to coastal and sandstone landscapes without the visual weight of a broad-canopied tree."],
  ["Carpobrotus glaucescens", "Pigface", "Aizoaceae", "coastal groundcover", "0.15 m H × 1–2 m W", "Full sun", "Sandy, sharply drained soil", "Very low", ["NATIVE", "DROUGHT", "COASTAL"], "A vigorous coastal succulent with pink-purple flowers and edible fruit. It is highly effective for stabilising sandy banks, spilling over walls and creating low-maintenance coastal groundcover."],
  ["Ceratopetalum gummiferum", "NSW Christmas Bush", "Cunoniaceae", "feature tree", "4–8 m H × 3–5 m W", "Full sun to part shade", "Moist, well-drained acidic soil", "Moderate", ["NATIVE", "FEATURE"], "A celebrated Sydney-region tree whose cream flowers are followed by vivid red enlarged sepals around Christmas. It is an excellent seasonal feature for protected gardens with reliable moisture."],
  ["Chrysocephalum apiculatum", "Yellow Buttons", "Asteraceae", "flowering groundcover", "0.2–0.6 m H × 0.8 m W", "Full sun", "Well-drained soil", "Low once established", ["NATIVE", "DROUGHT"], "Silver-grey foliage and clusters of small golden flowers create a durable, soft-edged groundcover. It suits sunny verges, roof gardens and naturalistic mass planting."],
  ["Cissus antarctica", "Kangaroo Vine", "Vitaceae", "shade climber", "Climber to 4–8 m", "Part shade to shade", "Moist, well-drained soil", "Moderate", ["NATIVE", "SHADE"], "A vigorous but manageable rainforest climber with fresh green foliage. It is useful for shaded screens, internal courtyards and green walls where tropical density is wanted without exotic foliage."],
  ["Corymbia gummifera", "Red Bloodwood", "Myrtaceae", "habitat tree", "15–25 m H × 8–15 m W", "Full sun", "Sandy, free-draining soil", "Low once established", ["NATIVE", "DROUGHT"], "An iconic sandstone tree with tessellated bark, white flowers and large woody capsules. It is a substantial habitat and canopy tree for restoration, acreage and appropriately scaled public landscapes."],
  ["Crowea exalata", "Small Crowea", "Rutaceae", "flowering shrub", "0.5–1 m H × 1 m W", "Full sun to part shade", "Well-drained acidic soil", "Moderate", ["NATIVE"], "A neat small shrub with star-shaped pink flowers over a long season. It brings fine detail to sheltered native gardens, containers and the front of lightly shaded borders."],
  ["Dampiera stricta", "Blue Dampiera", "Goodeniaceae", "flowering groundcover", "0.2–0.4 m H × 0.5 m W", "Full sun to part shade", "Well-drained soil", "Low to moderate", ["NATIVE"], "Clear blue flowers sit above low grey-green foliage, providing a rare colour note in native planting. Best in small groups at path edges, rockeries and raised, free-draining beds."],
  ["Davidsonia jerseyana", "Davidson's Plum", "Cunoniaceae", "edible rainforest tree", "4–8 m H × 2–4 m W", "Part shade", "Moist, rich, well-drained soil", "Moderate to high", ["NATIVE", "EDIBLE", "SHADE"], "A slender subtropical rainforest tree producing deep purple, sharply flavoured edible fruit on the trunk. It is a strong productive-garden feature for protected, frost-free sites."],
  ["Dichondra repens", "Kidney Weed", "Convolvulaceae", "lawn groundcover", "0.05–0.1 m H × spreading", "Part shade", "Moist, well-drained soil", "Moderate", ["NATIVE", "SHADE"], "A creeping native groundcover with rounded kidney-shaped leaves. It can form a soft low lawn in lightly trafficked shade or weave between stepping stones and understorey planting."],
  ["Dodonaea viscosa", "Hop Bush", "Sapindaceae", "screening shrub", "2–5 m H × 2–4 m W", "Full sun", "Well-drained soil", "Low once established", ["NATIVE", "DROUGHT", "COASTAL"], "A tough, fast-establishing shrub with narrow foliage and decorative winged seed capsules. It is ideal for informal screens, revegetation and exposed sites where reliability matters."],
  ["Eremophila maculata", "Spotted Emu Bush", "Scrophulariaceae", "flowering shrub", "1–2.5 m H × 1.5–3 m W", "Full sun", "Sharply drained soil", "Very low", ["NATIVE", "DROUGHT"], "Tubular flowers in red, pink or yellow attract birds above a hardy rounded shrub. It is an excellent dry-climate feature where humidity is moderate and drainage is uncompromising."],
  ["Eucalyptus haemastoma", "Scribbly Gum", "Myrtaceae", "habitat tree", "10–20 m H × 8–15 m W", "Full sun", "Sandy sandstone soil", "Low once established", ["NATIVE", "DROUGHT"], "Smooth white bark traced with insect scribbles gives this Sydney sandstone tree exceptional identity. It is best used for ecological restoration, acreage and large naturalistic landscapes."],
  ["Eucalyptus paniculata", "Grey Ironbark", "Myrtaceae", "canopy tree", "20–30 m H × 10–18 m W", "Full sun", "Well-drained loam to clay", "Low once established", ["NATIVE", "DROUGHT"], "A tall Sydney-region eucalypt with deeply furrowed dark ironbark and white flowers. Its scale and ecological value suit parks, large sites and habitat restoration rather than constrained gardens."],
  ["Ficinia nodosa", "Knobby Club-rush", "Cyperaceae", "coastal sedge", "0.5–1 m H × 0.6 m W", "Full sun", "Sand to moist soil", "Low to moderate", ["NATIVE", "COASTAL"], "A robust rush-like plant with dark green stems and distinctive seed heads. It tolerates salt, wind and variable moisture, making it valuable for coastal mass planting and bioswales."],
  ["Glochidion ferdinandi", "Cheese Tree", "Phyllanthaceae", "habitat tree", "6–15 m H × 4–8 m W", "Full sun to part shade", "Moist, well-drained soil", "Moderate", ["NATIVE"], "A quick-growing east-coast tree with rounded leaves and segmented fruit. It is a useful pioneer and bird-supporting canopy for creek lines, habitat gardens and informal screening."],
  ["Goodenia ovata", "Hop Goodenia", "Goodeniaceae", "fast shrub", "1–2 m H × 1.5–2 m W", "Full sun to part shade", "Adaptable, well-drained soil", "Moderate", ["NATIVE"], "A fast, adaptable shrub with fresh green foliage and yellow flowers. It quickly fills gaps in habitat planting and works well as a soft informal screen or restoration nurse plant."],
  ["Grevillea sericea", "Pink Spider Flower", "Proteaceae", "flowering shrub", "0.5–2 m H × 1–2 m W", "Full sun to part shade", "Well-drained low-phosphorus soil", "Low once established", ["NATIVE", "DROUGHT"], "Fine foliage and elegant pink spider flowers give this Sydney sandstone grevillea a delicate appearance. It is a valuable small habitat shrub for naturalistic gardens."],
  ["Hakea dactyloides", "Finger Hakea", "Proteaceae", "habitat shrub", "2–4 m H × 2–3 m W", "Full sun", "Sandy, free-draining soil", "Low once established", ["NATIVE", "DROUGHT"], "A sandstone shrub with leathery leaves, pale flowers and woody fruit. It adds durable mid-storey structure and habitat value to exposed native gardens."],
  ["Hakea sericea", "Silky Hakea", "Proteaceae", "screening shrub", "2–4 m H × 2–3 m W", "Full sun", "Well-drained low-phosphorus soil", "Low once established", ["NATIVE", "DROUGHT", "COASTAL"], "Dense needle-like foliage and pale flowers make this a formidable habitat and barrier shrub. Use it away from paths for wildlife refuge, wind filtering and difficult dry sites."],
  ["Hybanthus monopetalus", "Slender Violet-bush", "Violaceae", "understorey shrub", "0.5–1.5 m H × 1 m W", "Part shade", "Well-drained soil", "Moderate", ["NATIVE", "SHADE"], "A light, fine-branched Sydney understorey shrub with small violet flowers. It is useful for adding authentic diversity beneath open tree canopies and along shaded paths."],
  ["Lepidozamia peroffskyana", "Scaly Zamia", "Zamiaceae", "architectural cycad", "2–4 m H × 2–4 m W", "Part shade", "Moist, well-drained soil", "Moderate", ["NATIVE", "SHADE", "FEATURE"], "A dramatic east-coast cycad with long arching fronds and a strong sculptural presence. Its slow growth and eventual scale suit protected feature positions in substantial gardens."],
  ["Livistona australis", "Cabbage Tree Palm", "Arecaceae", "canopy palm", "15–25 m H × 3–5 m W", "Full sun to part shade", "Moist, well-drained soil", "Moderate", ["NATIVE", "FEATURE"], "A tall native fan palm that creates an unmistakable vertical landmark. It suits wet gullies, large subtropical gardens and civic landscapes where fallen fronds can be managed."],
  ["Macadamia integrifolia", "Macadamia Nut", "Proteaceae", "edible tree", "8–15 m H × 6–10 m W", "Full sun", "Deep, well-drained soil", "Moderate", ["NATIVE", "EDIBLE"], "A handsome evergreen rainforest tree producing edible nuts after establishment. It combines productive value with dense shade and glossy foliage in warm, generously scaled gardens."],
  ["Melaleuca hypericifolia", "Hillock Bush", "Myrtaceae", "screening shrub", "2–4 m H × 2–4 m W", "Full sun to part shade", "Adaptable, tolerates moisture", "Low to moderate", ["NATIVE", "COASTAL"], "A robust spreading shrub with orange-red bottlebrush flowers and narrow foliage. It handles coastal exposure and pruning, making it useful for informal screening and embankments."],
  ["Microlaena stipoides", "Weeping Grass", "Poaceae", "native lawn grass", "0.2–0.6 m H × spreading", "Part shade", "Moist, well-drained soil", "Moderate", ["NATIVE", "SHADE"], "A soft, fine-textured native grass capable of forming a lawn in low-traffic, partly shaded conditions. It also works as a naturalistic understorey beneath open woodland trees."],
  ["Myoporum parvifolium", "Creeping Boobialla", "Scrophulariaceae", "groundcover", "0.1–0.3 m H × 1.5–3 m W", "Full sun", "Well-drained soil", "Low once established", ["NATIVE", "DROUGHT", "COASTAL"], "A fast-spreading evergreen groundcover with tiny leaves and white or pink flowers. It is effective on banks, between rocks and across broad low-maintenance sunny areas."],
  ["Olearia ramulosa", "Twiggy Daisy-bush", "Asteraceae", "flowering shrub", "1–2 m H × 1–2 m W", "Full sun", "Well-drained soil", "Low once established", ["NATIVE", "DROUGHT"], "A fine-branched shrub carrying masses of small white daisy flowers. It provides a light, flowering middle layer in habitat gardens and dry naturalistic planting."],
  ["Ozothamnus diosmifolius", "Rice Flower", "Asteraceae", "flowering shrub", "1–2 m H × 1–1.5 m W", "Full sun", "Well-drained acidic soil", "Moderate", ["NATIVE"], "Dense heads of white, sometimes pink-tinged buds create an elegant long-lasting display. Rice flower is useful in cut-flower gardens and refined coastal or sandstone planting."],
  ["Persoonia levis", "Broad-leaved Geebung", "Proteaceae", "habitat shrub", "2–5 m H × 2–4 m W", "Full sun to part shade", "Sandy, free-draining soil", "Low once established", ["NATIVE", "DROUGHT"], "A distinctive sandstone shrub with flaky bark, broad leaves and yellow flowers followed by fleshy fruit. Best retained or established in ecological and naturalistic settings."],
  ["Pimelea linifolia", "Slender Rice Flower", "Thymelaeaceae", "flowering shrub", "0.5–1.5 m H × 1 m W", "Full sun to part shade", "Sandy, well-drained soil", "Low once established", ["NATIVE"], "A delicate Sydney-region shrub with clusters of white flowers and fine foliage. It is most successful in lightly disturbed sandstone-style gardens with excellent drainage."],
  ["Pittosporum revolutum", "Rough-fruited Pittosporum", "Pittosporaceae", "understorey shrub", "1–3 m H × 1.5–2 m W", "Part shade", "Moist, well-drained soil", "Moderate", ["NATIVE", "SHADE"], "A naturally shaped understorey shrub with yellow fragrant flowers and orange seed capsules. It adds ecological value and seasonal detail beneath established canopy."],
  ["Prostanthera ovalifolia", "Oval-leaf Mint Bush", "Lamiaceae", "fragrant shrub", "1.5–3 m H × 1.5–2.5 m W", "Full sun to part shade", "Moist, well-drained soil", "Moderate", ["NATIVE", "FRAGRANT"], "Aromatic foliage and masses of purple flowers make this one of the most garden-worthy mint bushes. It performs best in a cool root zone with protection from harsh afternoon heat."],
  ["Rhagodia spinescens", "Spiny Saltbush", "Amaranthaceae", "silver groundcover", "0.5–1.5 m H × 1.5–3 m W", "Full sun", "Adaptable, well-drained soil", "Very low", ["NATIVE", "DROUGHT", "COASTAL"], "Silver-grey leaves and a spreading habit make this saltbush valuable for harsh, exposed landscapes. It tolerates pruning and can form a clean low mound or broad groundcover."],
  ["Scaevola aemula", "Fairy Fan-flower", "Goodeniaceae", "flowering groundcover", "0.2–0.5 m H × 0.8–1.5 m W", "Full sun to part shade", "Well-drained soil", "Moderate", ["NATIVE", "COASTAL"], "Fan-shaped blue-purple flowers are carried for months above spreading foliage. It is ideal for containers, sunny edges and cascading over low retaining walls."],
  ["Tasmannia lanceolata", "Mountain Pepper", "Winteraceae", "edible shrub", "2–5 m H × 2–3 m W", "Part shade", "Moist, acidic soil", "Moderate", ["NATIVE", "EDIBLE", "SHADE"], "Glossy aromatic leaves and dark peppery berries make this a handsome bushfood shrub. It prefers cool, protected positions and consistent moisture."],
  ["Tetragonia tetragonioides", "Warrigal Greens", "Aizoaceae", "edible groundcover", "0.2 m H × 1–2 m W", "Full sun to part shade", "Well-drained soil", "Moderate", ["NATIVE", "EDIBLE", "COASTAL"], "A vigorous sprawling coastal plant whose leaves are used as a cooked green. It suits productive native gardens and informal groundcover where its spread can be managed."],
  ["Wahlenbergia stricta", "Australian Bluebell", "Campanulaceae", "flowering perennial", "0.3–0.8 m H × 0.4 m W", "Full sun to part shade", "Well-drained soil", "Low to moderate", ["NATIVE"], "Fine stems carry clear blue bell-shaped flowers above a small basal clump. It is best woven through meadow-style native planting rather than used as a solitary specimen."],
  ["Xerochrysum bracteatum", "Golden Everlasting", "Asteraceae", "flowering perennial", "0.4–1 m H × 0.5 m W", "Full sun", "Well-drained soil", "Low to moderate", ["NATIVE", "DROUGHT"], "Papery flowers in gold and cultivated colour forms provide a long, bright season and excellent pollinator value. It is suited to sunny naturalistic beds and cut-flower planting."],
];

const taxonomyFixes = new Map([
  ["carex-oshimensis", { remove: ["NATIVE"] }],
  ["ficus-elastica", { remove: ["NATIVE"] }],
  ["ficus-lyrata", { remove: ["NATIVE"] }],
  ["pennisetum-advena", { remove: ["NATIVE"] }],
  ["pennisetum-alopecuroides", { remove: ["NATIVE"] }],
  ["lomandra-fluvialtilis", { latin_name: "Lomandra fluviatilis", genus: "Lomandra" }],
  ["lomandra-fluvitalis", { latin_name: "Lomandra fluviatilis", genus: "Lomandra" }],
  ["grevillea-rosmarinfolia", { latin_name: "Grevillea rosmarinifolia", genus: "Grevillea" }],
  ["prostanthera-seiberi", { latin_name: "Prostanthera sieberi", genus: "Prostanthera" }],
  ["tristania-laurina", { latin_name: "Tristaniopsis laurina", genus: "Tristaniopsis" }],
]);
const verifiedPhotoOverrides = new Map([
  ["tetragonia-tetragonioides", {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Tetragonia_tetragonioides.jpg/1280px-Tetragonia_tetragonioides.jpg",
    reference: commonsSource("Tetragonia tetragonioides"),
  }],
  ["acer-platanoides", {
    url: "https://inaturalist-open-data.s3.amazonaws.com/photos/678451031/large.jpg",
    reference: {
      title: "Norway maple foliage photograph",
      source: "iNaturalist · Patrice Dupont · CC BY",
      url: "https://www.inaturalist.org/photos/678451031",
    },
  }],
  ["aloe-polyphylla", {
    url: "https://inaturalist-open-data.s3.amazonaws.com/photos/366809855/large.jpeg",
    reference: {
      title: "Spiral aloe rosette photograph",
      source: "iNaturalist · Justin Ponder · CC BY",
      url: "https://www.inaturalist.org/photos/366809855",
    },
  }],
]);
const duplicateAliases = new Map([
  ["grevillea-rosmarinfolia", "grevillea-rosmarinifolia"],
  ["lomandra-fluvialtilis", "lomandra-fluviatilis"],
  ["lomandra-fluvitalis", "lomandra-fluviatilis"],
  ["tristania-laurina", "tristaniopsis-laurina"],
]);

function slugify(value) {
  return value.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function alaMatch(scientificName) {
  const url = `https://bie.ala.org.au/ws/search.json?q=${encodeURIComponent(scientificName)}&pageSize=10`;
  const body = await requestJson(url);
  const rows = body?.searchResults?.results ?? [];
  return rows.find((row) => row.name?.toLowerCase() === scientificName.toLowerCase() && row.taxonomicStatus === "accepted")
    ?? rows.find((row) => row.name?.toLowerCase() === scientificName.toLowerCase())
    ?? rows[0];
}

async function wikipediaImage(scientificName) {
  const api = new URL("https://en.wikipedia.org/w/api.php");
  api.search = new URLSearchParams({
    action: "query", format: "json", origin: "*", redirects: "1",
    prop: "pageimages", piprop: "thumbnail|original", pithumbsize: "900", titles: scientificName,
  });
  const data = await requestJson(api);
  const page = Object.values(data?.query?.pages ?? {})[0];
  return page?.thumbnail?.source ?? page?.original?.source ?? null;
}

async function requestJson(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(url, { headers: { "User-Agent": "Profile-Landscapes-Catalogue/1.0 (website catalogue maintenance)" } });
    const text = await response.text();
    if (response.ok && text.trim().startsWith("{")) {
      await sleep(180);
      return JSON.parse(text);
    }
    if (attempt === 4) throw new Error(`JSON request failed (${response.status}): ${String(url)}`);
    await sleep(1000 * (attempt + 1));
  }
}

async function imageWorks(url) {
  if (!url?.trim()) return false;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Profile-Landscapes-Catalogue/1.0", Range: "bytes=0-2047" },
      signal: AbortSignal.timeout(12000),
    });
    return response.ok && (response.headers.get("content-type") ?? "").startsWith("image/");
  } catch {
    return false;
  }
}

for (const entry of catalogue) {
  const fix = taxonomyFixes.get(entry.slug);
  if (fix) {
    if (fix.remove) entry.tags = (entry.tags ?? []).filter((tag) => !fix.remove.includes(tag));
    if (fix.latin_name) entry.latin_name = fix.latin_name;
    if (fix.genus) entry.genus = fix.genus;
  }
  entry.references = Array.isArray(entry.references) ? entry.references : [];
  if (verifiedPhotoOverrides.has(entry.slug)) {
    const override = verifiedPhotoOverrides.get(entry.slug);
    entry.images = [{ alt: `${entry.common_name || entry.latin_name} (${entry.latin_name})`, url: override.url }];
    entry.references = [...entry.references.filter((ref) => ref.source !== "Wikimedia Commons" && !ref.source?.startsWith("iNaturalist")), override.reference];
  }
}

const bySlug = new Map(catalogue.map((entry) => [entry.slug, entry]));
let added = 0;
let repaired = 0;
let verified = 0;

for (const profile of profiles) {
  const [latinName, fallbackCommon, fallbackFamily, useType, matureSize, light, soil, water, tags, description] = profile;
  const slug = slugify(latinName);
  const ala = await alaMatch(latinName);
  if (!ala?.name) throw new Error(`No ALA match for ${latinName}`);
  const commonName = ala.commonNameSingle || fallbackCommon;
  const family = ala.family || fallbackFamily;
  const imageUrl = ala.largeImageUrl || ala.imageUrl || ala.thumbnailUrl || null;
  const imageOk = await imageWorks(imageUrl);
  const references = [
    { ...source, url: ala.guid || ala.infoSourceURL || source.url },
    alaImageSource(latinName),
  ];
  const next = {
    slug,
    latin_name: ala.name || latinName,
    common_name: commonName,
    family,
    genus: (ala.name || latinName).split(" ")[0],
    description,
    climate_zones: ["temperate", "subtropical", ...(tags.includes("COASTAL") ? ["coastal"] : [])],
    tags: [...new Set(tags)],
    care: { soil, light, water, growthRate: "Moderate", matureSize },
    seasons: null,
    companions: [],
    images: imageOk ? [{ alt: `${commonName} (${ala.name || latinName})`, url: imageUrl }] : [],
    cultivars: [],
    landscape_use: useType,
    references,
  };
  if (bySlug.has(slug)) {
    const current = bySlug.get(slug);
    Object.assign(current, { ...current, ...next, images: next.images.length ? next.images : current.images });
  } else {
    catalogue.push(next);
    bySlug.set(slug, next);
    added++;
  }
}

// Consolidate known spelling aliases into their accepted record. Nursery links
// are updated in the committed snapshot below so the cleanup is reproducible.
for (const [alias, canonical] of duplicateAliases) {
  const aliasEntry = bySlug.get(alias);
  const canonicalEntry = bySlug.get(canonical);
  if (aliasEntry && canonicalEntry) {
    if (!canonicalEntry.images?.length && aliasEntry.images?.length) canonicalEntry.images = aliasEntry.images;
    bySlug.delete(alias);
    catalogue.splice(catalogue.indexOf(aliasEntry), 1);
  }
}

if (!bySlug.has("grevillea-peaches-and-cream")) {
  const entry = {
    slug: "grevillea-peaches-and-cream",
    latin_name: "Grevillea 'Peaches & Cream'",
    common_name: "Grevillea Peaches & Cream",
    family: "Proteaceae",
    genus: "Grevillea",
    description: "A compact Australian hybrid grevillea with large cream flower clusters that mature through peach and apricot tones. The long flowering season, dense habit and nectar-rich blooms make it a reliable feature shrub for Sydney gardens.",
    climate_zones: ["temperate", "subtropical", "coastal"],
    tags: ["NATIVE", "DROUGHT", "FEATURE"],
    care: { soil: "Well-drained, low-phosphorus soil", light: "Full sun to light shade", water: "Low once established", growthRate: "Moderate to fast", matureSize: "1.5–2 m H × 1.5–2 m W" },
    seasons: { flowering: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    companions: ["lomandra-longifolia", "dianella-caerulea", "westringia-fruticosa"],
    images: [{ alt: "Representative Grevillea foliage and flower", url: "https://images.ala.org.au/image/80270608-9ba2-47f6-8e1f-b57164d27cef/large" }],
    cultivars: [],
    landscape_use: "Feature shrub, informal screen, bird-attracting garden and mixed native border.",
    references: [
      { title: "Grevillea 'Peaches and Cream' living collection record", source: "Australian Botanic Garden Mount Annan", url: "https://australianbg.gardenexplorer.org/taxon-51574.aspx" },
      { title: "Representative Grevillea photograph", source: "Atlas of Living Australia image service", url: "https://bie.ala.org.au/search?q=Grevillea" },
    ],
  };
  catalogue.push(entry);
  bySlug.set(entry.slug, entry);
  added++;
}

// Validate every current hero image. Failed remote images are replaced through
// the same scientific-name lookup instead of leaving a broken card.
const concurrency = 10;
for (let offset = 0; offset < catalogue.length; offset += concurrency) {
  await Promise.all(catalogue.slice(offset, offset + concurrency).map(async (entry) => {
    const current = entry.images?.find((image) => image?.url?.trim())?.url;
    if (await imageWorks(current)) {
      verified++;
      return;
    }
    let replacement = null;
    try {
      const ala = await alaMatch(entry.latin_name);
      replacement = ala?.largeImageUrl || ala?.imageUrl || ala?.thumbnailUrl || null;
    } catch {}
    if (await imageWorks(replacement)) {
      entry.images = [{ alt: `${entry.common_name || entry.latin_name} (${entry.latin_name})`, url: replacement }];
      entry.references = [...(entry.references ?? []).filter((ref) => ref.source !== "Wikimedia Commons"), alaImageSource(entry.latin_name)];
      repaired++;
    } else {
      entry.images = entry.images?.length ? entry.images : (previousBySlug.get(entry.slug)?.images ?? []);
    }
  }));
  process.stdout.write(`\rChecked ${Math.min(offset + concurrency, catalogue.length)} / ${catalogue.length}`);
}

catalogue.sort((a, b) => a.latin_name.localeCompare(b.latin_name));
await fs.writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`);
const plantPath = path.resolve("lib/db/seed-data/plants.json");
const plantCatalogue = JSON.parse(await fs.readFile(plantPath, "utf8"));
for (const plant of plantCatalogue) {
  if (duplicateAliases.has(plant.encyclopedia_slug)) plant.encyclopedia_slug = duplicateAliases.get(plant.encyclopedia_slug);
}
await fs.writeFile(plantPath, `${JSON.stringify(plantCatalogue, null, 2)}\n`);
console.log(`\nCatalogue curated: ${catalogue.length} entries, ${added} added, ${repaired} images repaired, ${verified} images verified.`);
