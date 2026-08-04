import type { Section } from "../schema";

export const aboutSections: Section[] = [
  {
    type: "page_head",
    props: {
      crumbs: [{ label: "Home", href: "/" }, { label: "About" }],
      title: "A landscape practice,",
      titleItalic: "built around delivery.",
      lede: "Commercial landscape construction, design, horticulture and long-term care—under one roof in Petersham since 1999.",
    },
  },
  {
    type: "two_col",
    props: {
      eyebrow: "Our story",
      title: "One yard, one ute, and a plan to grow what we plant.",
      body: "Carlo Capogreco founded Profile Landscapes in 1999 on the conviction that the best landscapes are built by people who understand how they will establish, perform and mature. That practical connection between construction and horticulture remains our edge.\n\nToday our project managers, designers, estimators, qualified landscapers, civil specialists, horticulturists and maintenance crews work together across Sydney and surrounding regions. We partner with developers, builders, councils, government agencies, architects and property owners from early planning through construction, establishment and long-term care.",
    },
  },
  {
    type: "pillars",
    props: {
      eyebrow: "Why Profile Landscapes",
      title: "Experience is useful.",
      titleItalic: "Accountability is better.",
      items: [
        { number: "01", title: "Complete delivery", body: "Planning and design support, estimating, construction, planting, establishment and maintenance coordinated by one accountable team." },
        { number: "02", title: "Practical project management", body: "Clear programmes, cost awareness, risk management, contract administration, site coordination and reporting that clients can act on." },
        { number: "03", title: "Safety and quality", body: "Strong workplace safety systems, qualified crews, traceable quality checks and careful delivery for our people, clients and the wider community." },
        { number: "04", title: "Sustainable outcomes", body: "Responsible material choices, water-efficient irrigation and resilient planting strategies designed for long-term site performance." },
      ],
    },
  },
  {
    type: "two_col",
    props: {
      eyebrow: "How we work",
      title: "Practical advice before expensive decisions.",
      body: "Every project is different. We work with clients and consultants from the earliest useful stage to understand the site, programme, budget and intended outcome. Our team tests buildability, identifies risk and offers value-engineered alternatives without losing the design intent.\n\nOnce on site, experienced project managers coordinate people, procurement, programme, quality and communication. Our involvement can continue after handover through establishment and tailored maintenance, protecting both the landscape and the investment behind it.",
      image: "/assets/projects/trio-camperdown-pool-restored-v2.webp",
      imageAlt: "Completed landscape construction and planting at Trio Apartments, Camperdown",
      imagePosition: "left",
    },
  },
  {
    type: "pillars",
    props: {
      eyebrow: "Our process",
      title: "Four connected stages.",
      titleItalic: "One continuous standard.",
      items: [
        { number: "01", title: "Consult", body: "We establish the objectives, site conditions, stakeholders, budget, programme and information needed to move forward." },
        { number: "02", title: "Plan", body: "We develop buildable, cost-conscious solutions, coordinate scope and procurement, and resolve risk before it reaches site." },
        { number: "03", title: "Construct", body: "Qualified teams deliver the work safely, efficiently and to specification, with visible programme and quality controls." },
        { number: "04", title: "Establish", body: "Maintenance and horticultural care protect the design intent while planting establishes and the landscape begins to mature." },
      ],
    },
  },
  {
    type: "pillars",
    props: {
      eyebrow: "Where we work",
      title: "Landscapes for",
      titleItalic: "the way Sydney lives.",
      items: [
        { number: "01", title: "Commercial + retail", body: "Commercial developments, workplaces, retail centres, hospitality venues and industrial facilities." },
        { number: "02", title: "Civic + infrastructure", body: "Government, local councils, streetscapes, parks, public open space and infrastructure projects." },
        { number: "03", title: "Community + care", body: "Education, healthcare, aged care, recreation facilities and landscapes that support community wellbeing." },
        { number: "04", title: "Residential communities", body: "Multi-residential developments, retirement living, shared courtyards and private residential landscapes." },
      ],
    },
  },
  {
    type: "cta",
    props: {
      eyebrow: "Our commitment",
      headline: "Built on strong partnerships and promises kept.",
      body: "From first consultation through to ongoing care, we bring transparent communication, dependable delivery and close attention to the details that make a landscape functional, sustainable and built to last.",
      button: { label: "Discuss your next project →", href: "/quote" },
    },
  },
];

export const servicesSections: Section[] = [
  {
    type: "page_head",
    props: {
      crumbs: [{ label: "Home", href: "/" }, { label: "Services" }],
      title: "Plan it, build it,",
      titleItalic: "keep it performing.",
      lede: "Complete commercial landscape delivery—from early planning and value engineering through construction, establishment and long-term management.",
    },
  },
  {
    type: "service_blocks",
    props: {
      services: [
        {
          number: "01", title: "Project Planning & Management", team: "Studio · Petersham",
          body: "Successful landscape delivery begins before mobilisation. Our project management and estimating teams work with clients, consultants and contractors to coordinate scope, programme, cost, risk and quality from the earliest useful stage.",
          activities: ["Project planning and programming", "Value engineering", "Budget and cost management", "Contract administration", "Site coordination", "Quality assurance and client reporting"],
        },
        {
          number: "02", title: "Landscape Construction", team: "Site · Sydney Metro",
          body: "We deliver complete commercial landscape packages using qualified crews, company-owned plant and proven construction systems. Core landscape work is self-performed, keeping programme, quality and accountability close to the site.",
          activities: ["Soft landscaping and planting", "Hard landscaping and paving", "Retaining walls and garden structures", "Streetscapes and public open space", "Commercial and residential developments", "Education, healthcare and civic environments"],
          cta: { label: "View delivered projects →", href: "/projects" },
        },
        {
          number: "03", title: "Landscape Design", team: "Design studio · Petersham",
          body: "Site-led concepts, planting strategies, documentation and visualisation developed by a team that understands construction. Every design decision is tested against buildability, budget, maintenance and long-term performance.",
          activities: ["Concept design and option studies", "Site and opportunities analysis", "Planting design", "3D visualisation", "Construction documentation", "Specifications and design support"],
          cta: { label: "Enter the design studio →", href: "/landscape-design" },
        },
        {
          number: "04", title: "Environmental Management", team: "Site + horticulture",
          body: "Responsible landscape and land-management works that protect soil, water and existing ecological value while supporting biodiversity and long-term site performance.",
          activities: ["Revegetation and native planting", "Bush regeneration", "Erosion and sediment control", "Environmental rehabilitation", "Biodiversity-focused planting", "Environmental establishment and monitoring"],
        },
        {
          number: "05", title: "Sports & Recreation", team: "Site · Sydney Metro",
          body: "Safe, durable and accessible outdoor environments for active communities, coordinated around performance requirements, public use, drainage, planting and long-term maintenance.",
          activities: ["Sporting and multi-purpose areas", "Parks and playground landscapes", "Outdoor fitness spaces", "Walking and shared paths", "Community facilities", "Associated planting and irrigation"],
        },
        {
          number: "06", title: "Irrigation & Water Management", team: "Irrigation team",
          body: "Commercial irrigation systems designed, installed and maintained to support healthy landscapes with responsible water use across developments, parks and large managed sites.",
          activities: ["Automatic irrigation systems", "Water-efficient design", "Smart controllers", "Drip and turf irrigation", "System upgrades", "Preventative maintenance and fault finding"],
        },
        {
          number: "07", title: "Tree Care & Arboriculture", team: "Tree management",
          body: "Tree-management support that helps clients protect healthy assets, manage risk and coordinate tree requirements throughout planning, construction and ongoing landscape care.",
          activities: ["Tree assessment and reporting", "Tree preservation planning", "Pruning and removal coordination", "Hazard and root-zone management", "Plant-health programmes", "Establishment care for new trees"],
        },
        {
          number: "08", title: "Horticulture & Nursery", team: "Nursery · Petersham",
          body: "Retail and trade plant supply from our Petersham yard, connected to the species knowledge used by our design, construction and maintenance teams.",
          activities: ["Retail and trade plant sales", "Plant procurement and delivery", "Advanced and specimen stock", "Custom growing programmes", "Species sourcing advice", "Project schedules and availability"],
          cta: { label: "Browse nursery stock →", href: "/plants" },
        },
        {
          number: "09", title: "Landscape Maintenance & Management", team: "Maintenance · Sydney Metro",
          body: "Proactive maintenance programmes protect the client’s investment and preserve the design intent from establishment onward. Programmes are tailored to the site, planting, use and reporting requirements.",
          activities: ["Lawn and garden maintenance", "Pruning, weed management and mulching", "Fertilising and seasonal planting", "Irrigation maintenance", "Site inspections and reporting", "Asset and defects management"],
          cta: { label: "Read practical care guides →", href: "/resources" },
        },
      ],
    },
  },
  {
    type: "two_col",
    props: {
      eyebrow: "Built capability",
      title: "One team from estimate to handover.",
      body: "Our estimating, project management, landscape construction, horticulture and maintenance teams operate as one practice. Builders and asset owners have a single accountable contractor across civil preparation, hardscape, irrigation, planting, establishment and defects.\n\nThat continuity makes it easier to protect the programme, communicate clearly and resolve site decisions before they become expensive.",
      image: "/assets/projects/trio-camperdown-pool-restored-v2.webp",
      imageAlt: "Pool terrace and pergola delivered at Trio Apartments, Camperdown",
    },
  },
  {
    type: "pillars",
    props: {
      eyebrow: "Delivery standard",
      title: "What clients can",
      titleItalic: "expect from us.",
      items: [
        { number: "01", title: "Safe delivery", body: "Practical WHS systems, capable supervision and clear coordination with clients, contractors and the community." },
        { number: "02", title: "Visible control", body: "Programme, procurement, costs, quality checks and project decisions kept current and communicated." },
        { number: "03", title: "Quality workmanship", body: "Careful set-out, proven materials and qualified people focused on the finish as well as long-term performance." },
        { number: "04", title: "Long-term care", body: "Establishment and maintenance options that keep the landscape healthy well beyond practical completion." },
      ],
    },
  },
  {
    type: "clients",
    props: {
      eyebrow: "Selected clients & partners",
      title: "Experience alongside leading builders, developers and public bodies.",
      clients: [
        { name: "Lendlease", logo: "/assets/clients/lendlease.png" },
        { name: "CPB Contractors", logo: "/assets/clients/cpb-contractors.png" },
        { name: "Richard Crookes", logo: "/assets/clients/richard-crookes.png" },
        { name: "BESIX Watpac", logo: "/assets/clients/besix-watpac.png" },
        { name: "Taylor Construction", logo: "/assets/clients/taylor-construction.png" },
        { name: "Billbergia", logo: "/assets/clients/billbergia.png" },
      ],
    },
  },
  {
    type: "cta",
    props: {
      eyebrow: "Tendering now",
      headline: "Let’s build the complete outdoor space.",
      body: "Send the drawings, specification, BOQ and programme. Our team will review the package and identify the right delivery pathway for your project.",
      button: { label: "Request a quote →", href: "/quote" },
    },
  },
];
