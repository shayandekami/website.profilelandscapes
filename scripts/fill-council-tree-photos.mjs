import fs from "node:fs/promises";
import path from "node:path";

const cataloguePath = path.resolve("lib/db/seed-data/encyclopedia.json");
const catalogue = JSON.parse(await fs.readFile(cataloguePath, "utf8"));
const targets = catalogue.filter((entry) =>
  entry.tags?.includes("COUNCIL_RECOMMENDED")
  && !entry.images?.some((image) => image?.url),
);

const allowedLicense = (value = "") => {
  const license = value.toLowerCase();
  return license.includes("publicdomain")
    || license.includes("creativecommons.org/publicdomain")
    || license.includes("/by/")
    || license.includes("/by-sa/");
};

const cleanName = (value = "") => value
  .replace(/\s+[A-Z][a-z]*\.$/, "")
  .replace(/\s+\([^)]+\)$/, "")
  .trim()
  .toLowerCase();

let filled = 0;
let remaining = 0;

for (let index = 0; index < targets.length; index++) {
  const entry = targets[index];
  const endpoint = new URL("https://api.gbif.org/v1/occurrence/search");
  endpoint.search = new URLSearchParams({
    scientificName: entry.latin_name,
    mediaType: "StillImage",
    basisOfRecord: "HUMAN_OBSERVATION",
    limit: "100",
  });
  try {
    const response = await fetch(endpoint, { headers: { "User-Agent": "Profile Landscapes council catalogue import" } });
    const body = response.ok ? await response.json() : { results: [] };
    const targetName = entry.latin_name.toLowerCase();
    let selected = null;
    for (const result of body.results ?? []) {
      const resultName = (result.species || cleanName(result.scientificName)).toLowerCase();
      if (resultName !== targetName && !targetName.startsWith(`${resultName} `)) continue;
      const media = result.media?.find((item) =>
        item.type === "StillImage"
        && item.identifier
        && allowedLicense(item.license),
      );
      if (media) {
        selected = media;
        break;
      }
    }
    if (!selected) {
      remaining++;
      continue;
    }
    entry.images = [{
      alt: `${entry.common_name || entry.latin_name} (${entry.latin_name})`,
      url: selected.identifier,
    }];
    entry.references = [
      ...(entry.references ?? []),
      {
        title: `${entry.latin_name} observation photograph`,
        source: `GBIF · ${selected.creator || selected.rightsHolder || selected.publisher || "contributor"} · ${selected.license}`,
        url: selected.references || `https://www.gbif.org/occurrence/${body.results?.[0]?.key ?? ""}`,
      },
    ];
    filled++;
  } catch {
    remaining++;
  }
  if (index % 15 === 0) process.stdout.write(`\rChecked ${index + 1}/${targets.length}`);
}

await fs.writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`);
console.log(`\nCouncil photo pass: ${filled} filled, ${remaining} remain as designed botanical placeholders.`);
