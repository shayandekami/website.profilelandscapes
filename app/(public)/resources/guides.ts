export type CareGuide = {
  slug: string;
  title: string;
  summary: string;
  category: "Water & soil" | "Pruning" | "Plant health" | "Seasonal care";
  image: string;
  minutes: number;
  difficulty: "Beginner" | "Intermediate";
  updated: string;
  intro: string;
  tools: string[];
  steps: Array<{ title: string; body: string; tip?: string }>;
  warnings?: string[];
  relatedTags: string[];
  keywords: string[];
};

const water = "/themes/profile-landscapes/resources/watering-soil-guide.webp";
const prune = "/themes/profile-landscapes/resources/pruning-guide.webp";
const health = "/themes/profile-landscapes/resources/plant-health-guide.webp";

export const CARE_GUIDES: CareGuide[] = [
  {
    slug: "how-to-water-new-plants",
    title: "How to water newly planted trees and shrubs",
    summary: "A practical establishment schedule for Sydney gardens, including the finger test, deep watering and when to ease off.",
    category: "Water & soil", image: water, minutes: 8, difficulty: "Beginner", updated: "2026-07-29",
    intro: "New plants fail more often from irregular watering than from a lack of fertiliser. The goal is to wet the full root ball and surrounding soil, then allow oxygen to return before the next soak.",
    tools: ["Hose with shower nozzle or drip line", "Trowel", "9–10 litre watering can", "Mulch"],
    steps: [
      { title: "Check below the surface", body: "Push a finger or trowel 5–8 cm into the soil beside the root ball. Water when it feels only slightly damp or dry—not simply because the mulch surface looks dry." },
      { title: "Build a shallow watering basin", body: "Form a low ring of soil just beyond the root ball. This slows runoff and directs water through the new roots rather than across the surface." },
      { title: "Water slowly and deeply", body: "Apply water at a rate the soil can absorb. As a starting point, use roughly 10 L for a small shrub, 20 L for a 25–45 L plant and 40 L or more for an advanced tree.", tip: "Split the volume into two passes on compacted or sloping ground." },
      { title: "Confirm penetration", body: "Wait ten minutes, then check the soil at root-ball depth. If the centre remains dry, reposition the emitter or gently break up water-repellent soil." },
      { title: "Adjust for weather and soil", body: "Check daily during the first two weeks, two to three times weekly through the first three months, then taper as roots establish. Sand dries faster; clay needs longer gaps." },
      { title: "Keep the trunk dry", body: "Maintain 50–100 mm of clear space around stems and trunks. Constant moisture against bark encourages rot and pests." },
    ],
    warnings: ["Do not follow a calendar blindly—rain, wind, container size and soil change demand.", "Wilting can also indicate waterlogging. Always test the soil first."],
    relatedTags: ["NATIVE", "TREE"], keywords: ["watering new plants", "tree establishment watering", "Sydney garden care"],
  },
  {
    slug: "how-to-mulch-a-garden",
    title: "How to mulch garden beds correctly",
    summary: "Choose the right mulch, set the correct depth and avoid the common ‘mulch volcano’ that damages trunks.",
    category: "Water & soil", image: water, minutes: 6, difficulty: "Beginner", updated: "2026-07-29",
    intro: "Mulch moderates soil temperature, reduces evaporation and suppresses weeds. Applied badly, it can repel water, bury crowns and create ideal conditions for collar rot.",
    tools: ["Coarse organic mulch", "Rake", "Gloves", "Watering can or hose"],
    steps: [
      { title: "Remove weeds first", body: "Pull weeds and their roots before covering the bed. Do not rely on mulch to kill established perennial weeds." },
      { title: "Water dry soil", body: "If the bed is dry, soak it before mulching. Water may run off a thick, dry mulch layer rather than reach the soil." },
      { title: "Select a coarse material", body: "Use aged arborist chips, leaf litter or a stable coarse mulch for ornamental beds. Fine mulch can knit together and restrict infiltration." },
      { title: "Apply 50–75 mm deep", body: "Spread mulch evenly. Shallower layers permit weeds; layers much deeper than 75 mm can reduce oxygen and hold excessive moisture." },
      { title: "Clear stems and crowns", body: "Pull mulch back 50–100 mm from small stems and at least 150 mm from tree trunks. Keep grass and mulch away from the root flare." },
      { title: "Top up, do not bury", body: "Check every six months. Restore the target depth only after accounting for material that remains—do not add another full layer each time." },
    ],
    warnings: ["Never pile mulch against a tree trunk.", "Avoid fresh, steaming mulch around sensitive young plants."],
    relatedTags: ["DROUGHT", "NATIVE"], keywords: ["how to mulch", "mulch depth Australia", "garden bed maintenance"],
  },
  {
    slug: "how-to-improve-sydney-clay-soil",
    title: "How to improve heavy clay soil",
    summary: "Diagnose drainage, protect soil structure and prepare planting zones without creating a water-holding pot.",
    category: "Water & soil", image: water, minutes: 10, difficulty: "Intermediate", updated: "2026-07-29",
    intro: "Clay is nutrient-rich and can grow excellent landscapes, but compaction and poor drainage cause trouble. Improvement is gradual: protect structure, add organic matter and select plants suited to the site.",
    tools: ["Garden fork", "Compost", "Coarse mulch", "Trowel", "Optional soil test"],
    steps: [
      { title: "Test drainage", body: "Dig a 30 cm hole, fill it with water, let it drain, then refill. Water remaining after 24 hours indicates a serious drainage constraint that needs design advice." },
      { title: "Avoid working wet clay", body: "Wait until the soil is moist but not sticky. Digging or walking on saturated clay destroys aggregates and creates hard clods." },
      { title: "Loosen a broad zone", body: "Fork the planting area beyond the root ball rather than digging a narrow smooth-sided hole. Roughen glazed sides so roots and water can move outward." },
      { title: "Use modest organic matter", body: "Blend mature compost through the upper soil across the whole bed. Do not replace the planting hole with rich imported soil, which can hold water like a bathtub." },
      { title: "Plant slightly proud", body: "Position the root flare at or slightly above finished soil level. In marginal drainage, use a broad low mound rather than burying the plant." },
      { title: "Mulch and protect", body: "Apply coarse mulch and keep traffic off the root zone. Earthworms and roots will improve structure over time." },
    ],
    warnings: ["Gypsum only improves sodic clay; it is not a universal clay treatment.", "Persistent standing water may require drainage engineering, not more soil amendments."],
    relatedTags: ["SHADE", "TREE"], keywords: ["improve clay soil Sydney", "planting in clay", "garden drainage"],
  },
  {
    slug: "how-to-prune-native-shrubs",
    title: "How to prune Australian native shrubs",
    summary: "Time pruning around flowering, make clean cuts and maintain dense natural form without cutting into bare old wood.",
    category: "Pruning", image: prune, minutes: 9, difficulty: "Beginner", updated: "2026-07-29",
    intro: "Many native shrubs respond well to regular light pruning. The safest approach is to start young, prune after flowering and retain foliage below every cut.",
    tools: ["Sharp bypass secateurs", "Loppers", "Disinfectant", "Gloves"],
    steps: [
      { title: "Identify the plant", body: "Check the encyclopedia profile before pruning. Banksias, grevilleas, westringias and bottlebrushes tolerate different levels of cutting." },
      { title: "Choose the right time", body: "For flowering shrubs, prune after the main flush finishes. Avoid hard pruning immediately before heatwaves, frost or during severe water stress." },
      { title: "Remove problems first", body: "Cut dead, damaged, rubbing and diseased growth back to a healthy junction. Clean tools after diseased material." },
      { title: "Shorten to foliage", body: "Reduce long shoots by up to one-third, cutting just above an outward-facing leaf or side branch. Leave healthy leaves below the cut." },
      { title: "Open selectively", body: "Remove a small number of crowded stems at their origin rather than shearing the entire surface. This preserves natural form and airflow." },
      { title: "Review before continuing", body: "Step back after every few cuts. Stop when the plant is balanced; more can be removed next season, but it cannot be put back." },
    ],
    warnings: ["Do not hard-prune mature banksias, hakeas or grevilleas into leafless wood unless the species is known to reshoot.", "Check for active bird nests before pruning."],
    relatedTags: ["NATIVE", "FRAGRANT"], keywords: ["prune Australian natives", "grevillea pruning", "native shrub maintenance"],
  },
  {
    slug: "how-to-prune-a-hedge",
    title: "How to keep a hedge dense from top to bottom",
    summary: "Set the correct profile, make formative cuts and recover patchy screens without creating a top-heavy wall.",
    category: "Pruning", image: prune, minutes: 8, difficulty: "Beginner", updated: "2026-07-29",
    intro: "A dense hedge is built through frequent light cuts while plants are young. The key is a slightly wider base so sunlight reaches the lower foliage.",
    tools: ["Hedge shears or trimmer", "Secateurs", "String line", "Eye and hearing protection"],
    steps: [
      { title: "Check species and season", body: "Confirm the plant tolerates clipping and avoid pruning during flowering if wildlife value matters." },
      { title: "Set a tapered profile", body: "Run string lines so the hedge is marginally wider at the base than the top. Vertical or top-heavy sides shade lower branches." },
      { title: "Reduce long leaders", body: "On young hedges, tip-prune new shoots to encourage branching. Do not wait until plants reach final height before making the first cut." },
      { title: "Cut the sides first", body: "Work upward with smooth passes, keeping the tool parallel to the line. Finish the top last." },
      { title: "Correct holes gradually", body: "Shorten growth around a gap to stimulate branching and redirect flexible shoots across it. Avoid exposing large areas of bare wood." },
      { title: "Feed the recovery", body: "Remove clippings, water deeply if dry and apply mulch. Only fertilise during active growth and according to the species." },
    ],
    warnings: ["Inspect for nests and hidden wire before using powered equipment.", "Wear eye and hearing protection and keep the cutting zone clear."],
    relatedTags: ["SCREEN", "NATIVE"], keywords: ["hedge maintenance", "prune screening plants", "dense hedge Australia"],
  },
  {
    slug: "how-to-clean-and-sharpen-secateurs",
    title: "How to clean and sharpen secateurs",
    summary: "Keep pruning cuts clean, reduce disease transfer and extend tool life with a ten-minute maintenance routine.",
    category: "Pruning", image: prune, minutes: 7, difficulty: "Beginner", updated: "2026-07-29",
    intro: "Blunt, dirty blades crush stems and carry plant pathogens. A quick clean after use and periodic sharpening makes pruning safer for both plant and gardener.",
    tools: ["Stiff brush", "Soapy water", "70% alcohol", "Sharpening stone", "Light machine oil"],
    steps: [
      { title: "Lock or dismantle safely", body: "Close and lock the tool. If dismantling, photograph the washer and spring order first and follow the manufacturer instructions." },
      { title: "Remove sap and dirt", body: "Brush debris away and clean blades with warm soapy water. Stubborn resin can be removed with a small amount of alcohol." },
      { title: "Disinfect", body: "Wipe blade surfaces with 70% alcohol, especially after diseased plants. Allow them to remain wet briefly, then dry." },
      { title: "Sharpen the bevel", body: "Follow the original bevel on the cutting blade. Push the stone away from the edge in consistent strokes; do not grind the flat anvil face." },
      { title: "Remove the burr", body: "Make one or two light passes on the flat back of the blade, keeping the stone flat." },
      { title: "Oil and test", body: "Apply a drop of oil to the pivot and spring. Open and close the tool, then test on a small green stem." },
    ],
    warnings: ["Wear gloves and always move the stone away from the cutting edge.", "Do not mix cleaning chemicals."],
    relatedTags: ["NATIVE"], keywords: ["sharpen secateurs", "clean pruning tools", "garden tool maintenance"],
  },
  {
    slug: "how-to-diagnose-yellow-leaves",
    title: "How to diagnose yellow leaves",
    summary: "Read the pattern before reaching for fertiliser: moisture, drainage, nutrients, roots and seasonal leaf drop.",
    category: "Plant health", image: health, minutes: 10, difficulty: "Intermediate", updated: "2026-07-29",
    intro: "Yellow leaves are a symptom, not a diagnosis. Where yellowing begins—old leaves, new leaves, one branch or the whole plant—helps narrow the cause.",
    tools: ["Trowel", "Hand lens", "Notebook or phone camera", "Optional pH test"],
    steps: [
      { title: "Map the pattern", body: "Note whether old or new leaves yellow first, whether veins remain green and whether symptoms affect one side or the whole plant." },
      { title: "Check soil moisture", body: "Inspect at root depth. Both drought and waterlogging reduce nutrient uptake and can look similar above ground." },
      { title: "Inspect leaves and stems", body: "Look beneath leaves and along stems for scale, mites, sooty mould, spots, chewing and physical damage." },
      { title: "Check the root zone", body: "Look for buried stems, mulch against the trunk, recent excavation, compaction or circling roots. Correct the cause before adding products." },
      { title: "Consider normal turnover", body: "Many evergreen plants shed older internal leaves seasonally. If new growth is healthy and the pattern is limited, monitor rather than treat." },
      { title: "Test before feeding", body: "Use soil or leaf testing for persistent problems. Apply only the nutrient shown to be deficient and follow rates suitable for native plants." },
    ],
    warnings: ["Do not automatically apply Epsom salts or high-phosphorus fertiliser.", "Sudden whole-canopy decline in a tree warrants assessment by a qualified arborist."],
    relatedTags: ["NATIVE", "TREE"], keywords: ["yellow leaves causes", "plant diagnosis Australia", "garden plant health"],
  },
  {
    slug: "how-to-manage-scale-and-aphids",
    title: "How to manage scale insects and aphids",
    summary: "Confirm the pest, protect beneficial insects and use the least disruptive treatment that will work.",
    category: "Plant health", image: health, minutes: 9, difficulty: "Beginner", updated: "2026-07-29",
    intro: "Aphids cluster on soft shoots; scale insects sit immobile on stems or leaves. Small populations are often controlled by predators, pruning and water before sprays are needed.",
    tools: ["Hand lens", "Hose nozzle", "Secateurs", "Horticultural soap or oil if required"],
    steps: [
      { title: "Confirm the insect", body: "Check new growth, leaf undersides and stems. Ant activity and sticky honeydew often point to sap-sucking pests." },
      { title: "Assess the damage", body: "A few insects on a vigorous plant rarely justify treatment. Act when growth distorts, foliage blackens with sooty mould or populations continue increasing." },
      { title: "Reduce plant stress", body: "Correct inconsistent watering and avoid excess nitrogen, which drives soft growth attractive to aphids." },
      { title: "Use physical control", body: "Hose aphids from robust plants and prune heavily infested tips into a sealed waste bag. Do not compost badly affected material." },
      { title: "Protect beneficial insects", body: "Look for ladybirds, lacewings and parasitised aphid ‘mummies’. Avoid broad-spectrum insecticides that remove these controls." },
      { title: "Apply targeted treatment", body: "If needed, use a registered horticultural soap or oil exactly as labelled. Cover the pest, avoid hot weather and test sensitive foliage first." },
    ],
    warnings: ["Never apply oil in extreme heat or to drought-stressed plants.", "Follow the product label; it is the legal direction for use."],
    relatedTags: ["FRAGRANT", "SCREEN"], keywords: ["scale insect treatment", "aphid control garden", "horticultural oil Australia"],
  },
  {
    slug: "how-to-prepare-a-garden-for-summer",
    title: "How to prepare a Sydney garden for summer",
    summary: "A heat-ready checklist covering irrigation, mulch, young plants, pots and what not to do before extreme weather.",
    category: "Seasonal care", image: water, minutes: 8, difficulty: "Beginner", updated: "2026-07-29",
    intro: "Summer resilience is built before a heatwave. Deep roots, functioning irrigation and protected soil matter more than emergency daily sprinkling.",
    tools: ["Irrigation timer", "Spare emitters", "Mulch", "Shade cloth for temporary protection"],
    steps: [
      { title: "Audit irrigation", body: "Run every zone and check blocked drippers, split lines and overspray. Place catch cups to identify uneven coverage." },
      { title: "Deep-water vulnerable plants", body: "Water young trees, recent planting and containers deeply in the cool of the morning before forecast extreme heat." },
      { title: "Restore mulch depth", body: "Maintain 50–75 mm while keeping trunks and crowns clear. Mulch reduces soil temperature and evaporation." },
      { title: "Group and protect pots", body: "Move containers out of reflected western heat, group them to reduce exposure and confirm drainage holes remain open." },
      { title: "Pause stressful work", body: "Avoid hard pruning, repotting and strong fertiliser immediately before hot weather. Tender new growth is more vulnerable." },
      { title: "Review after heat", body: "Wait before pruning scorched foliage; it may shade living tissue. Check stems for life and resume normal watering based on soil moisture." },
    ],
    warnings: ["Observe water restrictions and local fire-safety requirements.", "Do not cover plants with plastic; it traps heat."],
    relatedTags: ["DROUGHT", "COASTAL"], keywords: ["summer garden care Sydney", "heatwave plants", "drought garden maintenance"],
  },
  {
    slug: "how-to-establish-a-new-tree",
    title: "How to establish a newly planted tree",
    summary: "The first-year essentials: root flare, staking, watering, formative checks and when to call an arborist.",
    category: "Seasonal care", image: water, minutes: 12, difficulty: "Intermediate", updated: "2026-07-29",
    intro: "The first twelve months determine whether a tree develops stable roots and a healthy trunk. Most establishment problems come from planting too deep, poor watering or stakes left on too long.",
    tools: ["Hose or drip line", "Mulch", "Soft tree ties", "Secateurs", "Trowel"],
    steps: [
      { title: "Expose the root flare", body: "Find where the first structural roots leave the trunk. This point should be visible at finished soil level, not buried in potting mix or mulch." },
      { title: "Check stability", body: "The root ball should be firm while the trunk can move slightly. Stake only where needed and use broad flexible ties below the lowest point that keeps the tree upright." },
      { title: "Water the root ball", body: "During establishment, water both the original root ball and adjacent soil. A dripper placed only outside the potting mix may leave the centre dry." },
      { title: "Maintain a clear mulch ring", body: "Mulch broadly over the root zone, leaving the trunk and flare clear. Keep turf away to reduce competition and mower damage." },
      { title: "Inspect monthly", body: "Check ties, trunk wounds, pests, soil moisture and new growth. Loosen ties before they constrict and remove stakes once roots provide stability." },
      { title: "Prune conservatively", body: "Remove only broken or dead branches in the first season. Structural pruning should be planned over several years, ideally with arboricultural advice." },
    ],
    warnings: ["Do not add soil over the root flare.", "Large, leaning or damaged trees should be assessed by a qualified arborist."],
    relatedTags: ["TREE", "NATIVE"], keywords: ["new tree care", "tree establishment Sydney", "tree staking"],
  },
];

export const guideBySlug = (slug: string) => CARE_GUIDES.find((guide) => guide.slug === slug);
