type PlaceholderPlant = {
  latinName: string;
  commonName?: string | null;
  tags?: unknown;
};

const GRASSES = [
  "carex", "dianella", "festuca", "lomandra", "miscanthus", "pennisetum",
  "poa", "grass", "rush", "sedge",
];

const GROUNDCOVERS = [
  "ajuga", "dichondra", "groundcover", "ground cover", "myoporum",
  "pratia", "scaevola", "viola hederacea",
];

const TREES = [
  "acer", "angophora", "araucaria", "banksia integrifolia", "bark",
  "casuarina", "corymbia", "eucalyptus", "ficus", "fraxinus", "glochidion",
  "jacaranda", "leptospermum petersonii", "magnolia", "melaleuca",
  "palm", "platanus", "pyrus", "tree", "tristaniopsis", "waterhousia",
];

export function plantPlaceholder(plant: PlaceholderPlant) {
  const tags = Array.isArray(plant.tags) ? plant.tags.join(" ") : "";
  const identity = `${plant.latinName} ${plant.commonName || ""} ${tags}`.toLowerCase();

  if (GRASSES.some((term) => identity.includes(term))) {
    return "/assets/generated/placeholder-grass.webp";
  }
  if (GROUNDCOVERS.some((term) => identity.includes(term))) {
    return "/assets/generated/placeholder-groundcover.webp";
  }
  if (TREES.some((term) => identity.includes(term))) {
    return "/assets/generated/placeholder-tree.webp";
  }
  return "/assets/generated/placeholder-shrub.webp";
}
