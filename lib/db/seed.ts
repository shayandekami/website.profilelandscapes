import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import bcrypt from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "./index";
import {
  users,
  pages,
  projects,
  projectImages,
  siteSettings,
  productCategories,
  products,
  plants,
  encyclopediaEntries,
  jobPostings,
  careerApplications,
  applicationEvents,
  quotes,
  type Section,
} from "./schema";
import { homeSections } from "./seed-data/homepage";
import { aboutSections as carloAboutSections, servicesSections as carloServicesSections } from "./seed-data/carlo-content";

/**
 * Seeds the database with:
 *  - an owner account (admin@profilelandscapes.com.au; password from SEED_ADMIN_PASSWORD
 *    or randomly generated and printed once during seeding)
 *  - site settings (brand, contact)
 *  - the home page rendered as theme-agnostic sections
 *  - the about, services, contact pages
 *  - 4 featured projects
 *
 * Re-run is safe: it upserts on slug/email/key.
 */

async function main() {
  console.log("→ seeding…");
  const releaseVersion = process.env.SEED_RELEASE_VERSION;
  if (releaseVersion) {
    const [applied] = await db.select().from(siteSettings).where(eq(siteSettings.key, "seed_release_version")).limit(1);
    if (applied?.value === releaseVersion) {
      console.log(`✓ release seed ${releaseVersion} already applied; preserving CMS and admin changes`);
      process.exit(0);
    }
  }

  // Owner user — never ship a hardcoded password. Use SEED_ADMIN_PASSWORD if set,
  // otherwise generate a random one and print it ONCE below. onConflictDoNothing
  // means an already-seeded admin keeps its existing password (rotate that manually).
  const { randomBytes } = await import("node:crypto");
  const seedAdminPassword =
    process.env.SEED_ADMIN_PASSWORD || randomBytes(15).toString("base64url");
  const passwordHash = await bcrypt.hash(seedAdminPassword, 12);
  const [insertedAdmin] = await db
    .insert(users)
    .values({
      email: "admin@profilelandscapes.com.au",
      name: "Carlo Capogreco",
      passwordHash,
      role: "owner",
      avatarInitials: "CC",
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });
  if (insertedAdmin && !process.env.SEED_ADMIN_PASSWORD) {
    console.log(
      `\n   ⚠  NEW admin password (shown once — save it now):\n      admin@profilelandscapes.com.au / ${seedAdminPassword}\n`
    );
  }

  // Site settings — these are the brand-level fields the admin can edit
  // and any theme can read.
  const settings: { key: string; value: unknown }[] = [
    { key: "public_url", value: "https://profilelandscapes.com.au" },
    { key: "studio_name", value: "Profile Landscapes" },
    { key: "tagline", value: "Landscape craft, at scale." },
    { key: "phone", value: "(02) 9568 5868" },
    { key: "mobile", value: "0419 239 197" },
    { key: "email", value: "carlo@profilelandscapes.com.au" },
    { key: "address", value: "16 New Canterbury Rd, Petersham NSW 2049" },
    {
      key: "legal",
      value: {
        acn: "087 195 122",
        abn: "17 087 195 122",
        licence: "219051C",
        founded: 1999,
      },
    },
    {
      key: "theme_tokens",
      value: {
        ink: "#133024",
        paper: "#ffffff",
        bone: "#f4efe4",
        accent: "#1f5a3d",
        cream: "#e8dcb6",
      },
    },
  ];
  for (const s of settings) {
    await db
      .insert(siteSettings)
      .values(s)
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: s.value, updatedAt: new Date() } });
  }

  // ---------- Home page ----------
  const legacyHomeSections: Section[] = [
    {
      type: "hero",
      props: {
        eyebrow: "Sydney · Since 1999",
        title: "Landscape",
        titleItalic: "craft, at scale.",
        body: "A Sydney landscape practice — contractor, nursery and design studio under one roof. Twenty-seven years of hard and soft works, grown and built by the same team.",
        image: "/assets/projects/kinghorn-cancer-centre-restored.webp",
        imageAlt: "Timber seating and courtyard planting at The Kinghorn Cancer Centre, Darlinghurst",
        ctaPrimary: { label: "Invite us to tender →", href: "/contact" },
        ctaSecondary: { label: "See our work", href: "/projects" },
        badge: { value: "$20K — $11M", label: "Project range" },
      },
    },
    {
      type: "pillars",
      props: {
        eyebrow: "One practice, four arms",
        title: "A single team.",
        titleItalic: "Every part of the landscape.",
        items: [
          {
            number: "01",
            title: "Contracting",
            body: "Hard & soft works delivery for builders, developers and public bodies. Tendered or negotiated, from $20K to $11M.",
            cta: "Our services →",
            href: "/services",
          },
          {
            number: "02",
            title: "Nursery",
            body: "4,800+ plants grown at our Petersham yard. Retail & trade sales, with delivery across metropolitan Sydney.",
            cta: "Browse nursery →",
            href: "/nursery",
          },
          {
            number: "03",
            title: "Design studio",
            body: "Concept design, planting plans and 3D visualisation. In-house estimating through Buildsoft and Cubit.",
            cta: "Design studio →",
            href: "/landscape-design",
          },
          {
            number: "04",
            title: "Encyclopedia",
            body: "Three decades of field notes, curated into 318 plant entries — the species we specify, grow and maintain.",
            cta: "Open the encyclopedia →",
            href: "/encyclopedia",
          },
        ],
      },
    },
    {
      type: "stats",
      props: {
        eyebrow: "By the numbers",
        items: [
          { value: "27", label: "Years in Sydney" },
          { value: "4,800+", label: "Plants in nursery" },
          { value: "$11M", label: "Largest package" },
          { value: "318", label: "Encyclopedia entries" },
        ],
      },
    },
    {
      type: "cta",
      props: {
        eyebrow: "Start a conversation",
        headline: "Bring us in early.",
        body: "We do our best work when we're on the brief from concept through to handover. Send us drawings, BOQ, or a sketch on a napkin.",
        button: { label: "Invite us to tender →", href: "/contact" },
      },
    },
  ];

  await db
    .insert(pages)
    .values({
      slug: "/",
      title: "Profile Landscapes — Commercial landscape contractors, Sydney since 1999",
      lede: "Sydney-based landscape contractor, nursery and design studio. Since 1999.",
      sections: homeSections,
      heroImage: "/assets/projects/kinghorn-cancer-centre-restored.webp",
      seoTitle: "Profile Landscapes — Commercial landscape contractors, Sydney since 1999",
      seoDescription:
        "Sydney-based landscape contractor, nursery and design studio. Design, construction and maintenance for developers, builders and public bodies across NSW. Since 1999.",
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: pages.slug,
      set: {
        title: "Profile Landscapes — Commercial landscape contractors, Sydney since 1999",
        sections: homeSections,
        status: "live",
        updatedAt: new Date(),
      },
    });

  // ---------- About page ----------
  const aboutSections = carloAboutSections;
  await db
    .insert(pages)
    .values({
      slug: "/about",
      title: "About — Profile Landscapes",
      lede: "Contractor, nursery, design studio — under one roof in Petersham since 1999.",
      sections: aboutSections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoNothing({ target: pages.slug });

  const careerJobs = [
    {
      slug: "landscape-foreman", title: "Landscape Foreman", team: "Construction", location: "Sydney Metro", employmentType: "Full-time",
      summary: "Lead landscape construction crews delivering high-quality commercial and residential projects.",
      description: "Own daily site delivery, coordinate people and subcontractors, and maintain Profile Landscapes' standards for safety, programme and finish.",
      responsibilities: ["Lead daily pre-starts and allocate crew work", "Read plans, coordinate materials and track programme", "Maintain quality, safety and client communication"],
      requirements: ["Qualified landscaper with 5+ years' construction experience", "Demonstrated crew leadership", "Current driver licence and White Card"],
      desirable: ["Cert IV in Landscape Construction", "Excavator or skid-steer tickets"], salaryRange: "$95,000–$115,000 + super + vehicle", status: "live" as const, sortOrder: 1,
    },
    {
      slug: "horticulturist", title: "Horticulturist", team: "Nursery", location: "Petersham", employmentType: "Full-time",
      summary: "Care for nursery stock, advise customers and support plant selection for our project teams.",
      description: "A practical nursery role combining plant care, stock presentation and knowledgeable customer service.",
      responsibilities: ["Maintain plant health and presentation", "Receive and organise stock", "Advise retail, trade and internal project teams"],
      requirements: ["Cert III Horticulture or equivalent experience", "Strong plant identification skills", "Able to safely perform physical nursery work"],
      desirable: ["Retail nursery experience", "MR licence or forklift ticket"], status: "live" as const, sortOrder: 2,
    },
    {
      slug: "apprentice-landscaper", title: "Apprentice Landscaper", team: "Construction", location: "Various Sydney sites", employmentType: "Apprenticeship",
      summary: "Learn landscape construction on real projects with structured TAFE and on-site support.",
      description: "Build core trade skills across softscape, paving, drainage, irrigation and site safety.",
      responsibilities: ["Work safely with the site team", "Learn tools, materials and construction methods", "Attend and complete required TAFE study"],
      requirements: ["Genuine interest in landscape construction", "Reliable transport or ability to reach site", "Willingness to learn and work outdoors"],
      desirable: ["White Card", "Previous labouring or horticulture exposure"], status: "live" as const, sortOrder: 3,
    },
  ];
  for (const job of careerJobs) {
    await db.insert(jobPostings).values(job).onConflictDoNothing({ target: jobPostings.slug });
  }
  const seededJobs = await db.select().from(jobPostings);
  const jobBySlug = new Map(seededJobs.map((job) => [job.slug, job]));
  const candidateDir = join(process.cwd(), "storage", "applications");
  await mkdir(candidateDir, { recursive: true });
  const seededCandidates = [
    { ref: "APP-SEED-001", token: "seed-candidate-maya-chen-private-tracker", job: "landscape-foreman", first: "Maya", last: "Chen", email: "maya.chen@example.com", phone: "0412 555 014", suburb: "Marrickville NSW", exp: "6–10 years", rights: "Australian citizen", status: "shortlisted" as const, rating: 5, linkedin: "https://www.linkedin.com/in/maya-chen", statement: "I have eight years of landscape construction experience, including four years leading crews across commercial streetscape and high-end residential projects. I enjoy building clear site systems, mentoring apprentices and delivering difficult finishes well." },
    { ref: "APP-SEED-002", token: "seed-candidate-liam-oconnor-private-tracker", job: "horticulturist", first: "Liam", last: "O'Connor", email: "liam.oconnor@example.com", phone: "0433 555 027", suburb: "Dulwich Hill NSW", exp: "3–5 years", rights: "Permanent resident", status: "screening" as const, rating: 4, linkedin: "https://www.linkedin.com/in/liam-oconnor-hort", statement: "I am a qualified horticulturist with strong native plant identification and three years in a busy retail and production nursery. I am looking for a role that combines plant care, customer advice and project-based plant selection." },
    { ref: "APP-SEED-003", token: "seed-candidate-zara-williams-private-tracker", job: "apprentice-landscaper", first: "Zara", last: "Williams", email: "zara.williams@example.com", phone: "0451 555 038", suburb: "Ashfield NSW", exp: "Entry level / apprentice", rights: "Australian citizen", status: "new" as const, rating: null, linkedin: null, statement: "I am changing careers after working in outdoor education and want to build a practical trade in landscape construction. I have a White Card, am comfortable with physical work and am ready to start TAFE." },
    { ref: "APP-SEED-004", token: "seed-candidate-noah-patel-private-tracker", job: "landscape-foreman", first: "Noah", last: "Patel", email: "noah.patel@example.com", phone: "0408 555 046", suburb: "Parramatta NSW", exp: "10+ years", rights: "Australian citizen", status: "interview" as const, rating: 4, linkedin: "https://www.linkedin.com/in/noah-patel-landscapes", statement: "I have led civil landscape crews for more than ten years, with experience in programme coordination, subcontractor management, set-out and commercial handover. I am interested in Profile's quality-focused project mix." },
  ];
  for (const candidate of seededCandidates) {
    const resumeFilename = `${candidate.ref.toLowerCase()}-sample-cv.txt`;
    const resumePath = join(candidateDir, resumeFilename);
    await writeFile(resumePath, `SAMPLE CANDIDATE CV\n${candidate.first} ${candidate.last}\n${candidate.exp}\nFor demonstration and testing only.\n`);
    const [created] = await db.insert(careerApplications).values({
      referenceCode: candidate.ref, accessToken: candidate.token, jobId: jobBySlug.get(candidate.job)?.id,
      roleInterest: jobBySlug.get(candidate.job)?.title || "General expression of interest",
      firstName: candidate.first, lastName: candidate.last, email: candidate.email, phone: candidate.phone,
      suburb: candidate.suburb, linkedinUrl: candidate.linkedin, coverLetter: candidate.statement,
      yearsExperience: candidate.exp, availability: "Four weeks' notice", workRights: candidate.rights,
      driversLicence: true, resumePath, resumeFilename, resumeMime: "text/plain",
      resumeSize: 100, status: candidate.status, rating: candidate.rating, consentAt: new Date("2026-07-20"),
      reviewedAt: candidate.status === "new" ? null : new Date("2026-07-22"),
    }).onConflictDoNothing({ target: careerApplications.referenceCode }).returning();
    if (created) await db.insert(applicationEvents).values({
      applicationId: created.id, status: candidate.status, candidateVisible: true,
      message: candidate.status === "new" ? "Application received and awaiting review." : `Application progressed to ${candidate.status}.`,
    });
  }
  const seededQuotes = [
    {
      referenceCode: "Q-SEED-001",
      accessToken: "seed-quote-darlington-private-tracker",
      name: "Sophie Bennett",
      company: "Bennett Studio Architects",
      email: "sophie.bennett@example.com",
      phone: "0418 555 102",
      sector: "Commercial",
      budget: "$500K – $1M",
      siteAddress: "18–24 Golden Grove Street, Darlington",
      postcode: "2008",
      projectStage: "Tender / pricing",
      services: ["Landscape construction", "Planting / softscape", "Irrigation", "Tender pricing"],
      desiredStart: "Within 3–6 months",
      tenderDue: new Date("2026-08-21T12:00:00"),
      contactPreference: "Email",
      architect: "Bennett Studio Architects",
      brief: "Landscape construction tender for a 42-apartment mixed-use development. Scope includes podium planters, deep-soil tree planting, irrigation, feature paving interfaces, raised steel edging and 12 months establishment maintenance. Construction documentation and BOQ are available following acknowledgement of the tender conditions.",
      source: "website-quote-request",
      status: "in_reply" as const,
      notes: "Strong fit. Review podium access and cranage allowances before confirming tender participation.",
      receivedAt: new Date("2026-07-22T09:35:00"),
    },
    {
      referenceCode: "Q-SEED-002",
      accessToken: "seed-quote-concord-private-tracker",
      name: "Daniel Russo",
      company: "Russo Property Group",
      email: "daniel.russo@example.com",
      phone: "0422 555 187",
      sector: "Residential",
      budget: "$100K – $500K",
      siteAddress: "7 Flavelle Street, Concord",
      postcode: "2137",
      projectStage: "Construction documentation",
      services: ["Landscape construction", "Planting / softscape", "Irrigation"],
      desiredStart: "Within 1–3 months",
      contactPreference: "Phone",
      architect: "Northbank Architecture",
      brief: "New residential landscape following completion of a major renovation. Works include sandstone paving, pool surrounds, front entry, drainage upgrades, automated irrigation, mature screening and a low-maintenance native planting palette. Planning approval is complete and architectural documentation is at 90 percent.",
      source: "website-quote-request",
      status: "site_visit" as const,
      notes: "Site meeting requested for Thursday morning. Confirm rear access width and protection requirements around the completed pool.",
      receivedAt: new Date("2026-07-23T14:10:00"),
    },
  ];
  for (const quote of seededQuotes) {
    await db.insert(quotes).values(quote).onConflictDoNothing({ target: quotes.referenceCode });
  }

  // ---------- Contact page ----------
  const contactSections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }, { label: "Contact" }],
        title: "Tell us about",
        titleItalic: "your site.",
        lede: "Send us the brief — drawings, BOQ, or a short description — and Carlo will reply personally within two business days with a realistic programme and price.",
      },
    },
    {
      type: "contact_form",
      props: {
        tenderTitle: "Invite us to tender",
        tenderBody: "Already have a documented project or formal tender package? Email Carlo directly with the drawings, specification, BOQ, closing date and site contact.",
        tenderEmail: "carlo@profilelandscapes.com.au",
        tenderSubject: "Tender invitation - project name / suburb",
      },
    },
  ];
  await db
    .insert(pages)
    .values({
      slug: "/contact",
      title: "Contact — Profile Landscapes",
      lede: "Send us the brief and Carlo will reply personally within two business days.",
      sections: contactSections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoNothing({ target: pages.slug });

  // ---------- Services page ----------
  const servicesSections = carloServicesSections;
  await db
    .insert(pages)
    .values({
      slug: "/services",
      title: "Services — Profile Landscapes",
      sections: servicesSections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: pages.slug,
      set: { title: "Services — Profile Landscapes", sections: servicesSections, status: "live", updatedAt: new Date() },
    });

  // ---------- Projects page ----------
  const projectsSections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }, { label: "Projects" }],
        title: "Recent",
        titleItalic: "& signature work.",
        lede: "A working portfolio across residential, commercial, civic and healthcare landscapes — design and construction by the same team.",
      },
    },
    {
      type: "project_grid",
      props: {
        recentEyebrow: "From the live project register",
        recentTitle: "Selected recent appointments.",
        recentBody: "A current snapshot of landscape packages recently awarded or in delivery across Sydney. These appointments sit alongside a much broader active project register.",
        recentNote: "Selected recent appointments only. This is not a complete list of current or completed Profile Landscapes projects. Value bands are indicative of project scale only and do not disclose contract pricing.",
        featuredJob: {
          name: "Woolworths Eastern Creek",
          location: "Eastern Creek",
          client: "BESIX Watpac",
          stage: "In construction",
          value: "$1m+",
          summary: "A major landscape construction package currently progressing on site.",
        },
        recentJobs: [
          { name: "Woolworths Eastern Creek", location: "Eastern Creek", client: "BESIX Watpac", stage: "In construction", value: "$1m+" },
          { name: "Melrose Park Public School", location: "Melrose Park", client: "Taylor", stage: "In construction", value: "$750k–$1m" },
          { name: "WSA — Canine Facility", location: "Western Sydney Airport", client: "CPB Contractors", stage: "In construction", value: "$750k–$1m" },
          { name: "The Collective", location: "St Leonards", client: "Westbourne", stage: "In construction", value: "$250k–$500k" },
          { name: "The Switch Macquarie Park", location: "Macquarie Park", client: "Taylor", stage: "In construction", value: "$250k–$500k" },
          { name: "Tallowwood Apartments", location: "Sydney", client: "Versatile", stage: "In construction", value: "$250k–$500k" },
          { name: "Hardi Aged Care", location: "Blacktown", client: "Belmadar", stage: "Recently awarded", value: "$250k–$500k" },
        ],
      },
    },
    {
      type: "clients",
      props: {
        eyebrow: "Built in partnership",
        title: "Selected principal contractors, developers and project partners.",
        clients: [
          { name: "Lendlease", logo: "/assets/clients/lendlease.png" },
          { name: "CPB Contractors", logo: "/assets/clients/cpb-contractors.png" },
          { name: "Richard Crookes", logo: "/assets/clients/richard-crookes.png" },
          { name: "PERIFA", logo: "/assets/clients/perifa.png" },
          { name: "BESIX Watpac", logo: "/assets/clients/besix-watpac.png" },
          { name: "City of Sydney", logo: "/assets/clients/city-of-sydney.png" },
        ],
      },
    },
  ];
  await db
    .insert(pages)
    .values({
      slug: "/projects",
      title: "Projects — Profile Landscapes",
      sections: projectsSections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: pages.slug,
      set: { title: "Projects — Profile Landscapes", sections: projectsSections, status: "live", updatedAt: new Date() },
    });

  // ---------- Projects (portfolio entries) ----------
  const portfolio = [
    {
      slug: "kinghorn-cancer-centre",
      title: "The Kinghorn Cancer Centre",
      suburb: "Darlinghurst",
      sector: "healthcare" as const,
      principal: "Richard Crookes Constructions",
      packageValue: "$500K",
      summary: "A carefully detailed healing landscape integrating warm timber seating, established planting and accessible outdoor space.",
      body: "Profile Landscapes delivered the external landscape works for The Kinghorn Cancer Centre in Darlinghurst.\n\nThe finished courtyard balances robust institutional requirements with a calm, human scale: timber decking and seating are set against layered planting to create a welcoming place for patients, visitors and staff.",
      heroImage: "/assets/projects/kinghorn-cancer-centre-restored.webp",
      featured: true,
    },
    {
      slug: "canterbury-leagues-club",
      title: "Canterbury Leagues Club",
      suburb: "Belmore",
      sector: "commercial" as const,
      principal: "Canterbury Bankstown Leagues Club",
      packageValue: "$6.5M",
      summary: "Major car-park landscaping, water-feature forecourt and atrium garden works for one of Sydney's landmark hospitality venues.",
      body: "This multi-stage landscape package brought together large-scale water features, established palms, garden beds and detailed public-realm finishes.\n\nThe project is one of Profile Landscapes' award-winning commercial landscape works and demonstrates the team's ability to coordinate specialist landscape construction within a busy operating venue.",
      heroImage: "/assets/projects/canterbury-leagues-club-grounds-restored-v2.webp",
      featured: true,
    },
    {
      slug: "waterbrook-yowie-bay",
      title: "Waterbrook",
      suburb: "Yowie Bay",
      sector: "residential" as const,
      principal: "Private",
      summary: "A resort-like residential landscape shaped around cascading stonework, subtropical planting and strong connections between buildings and garden.",
      body: "Waterbrook is a richly planted residential landscape in Yowie Bay.\n\nNatural stone, level changes and layered subtropical planting create a sequence of garden rooms and a strong sense of arrival through the site.",
      heroImage: "/assets/projects/waterbrook-yowie-bay-restored-v2.webp",
      featured: true,
    },
    {
      slug: "tregoyd-gardens-mosman",
      title: "Tregoyd Gardens",
      suburb: "Mosman",
      sector: "residential" as const,
      principal: "Private",
      summary: "An immersive subtropical garden with a restrained pathway threaded through mature, layered foliage.",
      body: "Tregoyd Gardens is designed as an immersive green retreat.\n\nThe pathway is held within dense, layered foliage, using changes in leaf scale, tone and height to create depth while maintaining a clear and inviting circulation route.",
      heroImage: "/assets/projects/tregoyd-gardens-mosman-restored-v2.webp",
      featured: false,
    },
    {
      slug: "trio-apartments-camperdown",
      title: "Trio Apartments",
      suburb: "Camperdown",
      sector: "residential" as const,
      principal: "Watpac Construction",
      packageValue: "$1.2M",
      summary: "Landscape construction for a major apartment development, including a pool terrace, pergolas and layered communal planting.",
      body: "The Trio Apartments landscape provides a series of shared outdoor spaces for residents, centred on the pool terrace and its strong timber pergola structure.\n\nPlanting around the development softens the architecture and creates privacy, shade and a settled garden character across the communal areas.",
      heroImage: "/assets/projects/trio-camperdown-pool-restored-v2.webp",
      featured: true,
    },
    {
      slug: "fraser-suites-lumiere",
      title: "Fraser Suites / Lumiere",
      suburb: "Sydney CBD",
      sector: "commercial" as const,
      principal: "Multiplex Construction",
      packageValue: "$450K",
      summary: "A finely detailed elevated terrace combining timber decking, integrated seating and dense urban planting in the Sydney CBD.",
      body: "Profile Landscapes delivered the landscape works for Fraser Suites / Lumiere in the Sydney CBD.\n\nThe elevated terrace uses warm timber, dark metalwork and layered planting to create a sheltered outdoor setting within a dense city context.",
      heroImage: "/assets/projects/fraser-suites-lumiere-restored-v2.webp",
      featured: true,
    },
    {
      slug: "cranbrook-junior-school",
      title: "Cranbrook Junior School",
      suburb: "Rose Bay",
      sector: "healthcare" as const,
      principal: "Cranbrook School",
      summary: "A robust school landscape with generous paved gathering areas, integrated seating and a restrained native planting palette.",
      body: "The Cranbrook Junior School landscape is organised around clear circulation, durable outdoor learning and gathering spaces, and a planting palette suited to the exposed campus setting.\n\nThe result is a calm, legible landscape that supports daily school life while maturing into the architecture.",
      heroImage: "/assets/projects/cranbrook-junior-school-restored-v2.webp",
      featured: false,
    },
    {
      slug: "the-dixon-little-bay",
      title: "The Dixon",
      suburb: "Little Bay",
      sector: "residential" as const,
      principal: "Private",
      summary: "A formal communal garden organised around a long timber walkway and pergola, with lawns and young canopy trees.",
      body: "At The Dixon in Little Bay, the landscape is structured by a strong covered timber walk that connects the surrounding residences.\n\nSimple lawns, evenly placed trees and built-in timber elements give the courtyard a clear rhythm and a durable communal character.",
      heroImage: "/assets/projects/dixon-little-bay.webp",
      featured: false,
    },
    {
      slug: "warriewood-retirement-village",
      title: "Warriewood Retirement Village",
      suburb: "Warriewood",
      sector: "healthcare" as const,
      principal: "Private",
      summary: "A water-wise courtyard planting composition using sculptural succulents, flowering perennials and stone mulch.",
      body: "This retirement-living garden uses bold, low-maintenance planting to provide year-round form and seasonal colour.\n\nSculptural succulents sit among flowering spikes and river stone, creating a tactile garden that is legible from adjoining rooms and circulation spaces.",
      heroImage: "/assets/projects/warriewood-retirement-village.webp",
      featured: false,
    },
  ];
  const portfolioGalleries: Record<string, Array<{ url: string; alt: string }>> = {
    "canterbury-leagues-club": [
      {
        url: "/assets/projects/canterbury-leagues-club-waterfall.webp",
        alt: "Illuminated waterfall landscape at Canterbury Leagues Club",
      },
    ],
    "trio-apartments-camperdown": [
      {
        url: "/assets/projects/trio-camperdown-planting-restored-v2.webp",
        alt: "Layered subtropical planting at Trio Apartments, Camperdown",
      },
    ],
  };
  for (const p of portfolio) {
    const [saved] = await db
      .insert(projects)
      .values({ ...p, status: "live" })
      .onConflictDoUpdate({
        target: projects.slug,
        set: { ...p, status: "live", updatedAt: new Date() },
      })
      .returning({ id: projects.id, slug: projects.slug });
    if (saved && portfolioGalleries[saved.slug]) {
      await db.delete(projectImages).where(eq(projectImages.projectId, saved.id));
      await db.insert(projectImages).values(
        portfolioGalleries[saved.slug].map((image, order) => ({
          projectId: saved.id,
          ...image,
          order,
        }))
      );
    }
  }
  await db
    .update(projects)
    .set({ status: "draft", updatedAt: new Date() })
    .where(
      inArray(projects.slug, [
        "bench-terrace-george-street",
        "canterbury-waterfall",
        "tregoyd-courtyard",
        "tropical-boardwalk",
      ])
    );

  // ---------- Nursery page ----------
  const nurserySections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }, { label: "Nursery" }],
        title: "4,800 plants,",
        titleItalic: "grown in Petersham.",
        lede: "Retail and trade sales from our working yard. Advanced trees, specimen plants, groundcovers and grasses — the species we actually specify and install.",
      },
    },
    {
      type: "stats",
      props: {
        eyebrow: "By the numbers",
        items: [
          { value: "4,800+", label: "Plants in stock" },
          { value: "318", label: "Species available" },
          { value: "40+", label: "Advanced trees" },
          { value: "25yr", label: "Growing experience" },
        ],
      },
    },
    {
      type: "two_col",
      props: {
        eyebrow: "Retail & trade",
        title: "We grow what we plant.",
        body: "Every species in our yard is one we specify and install on project. That means our stock is commercial-grade, field-selected, and available in quantities builders and landscapers actually need. Open Monday–Saturday 7am–4pm. Trade accounts available.",
      },
    },
    {
      type: "cta",
      props: {
        eyebrow: "Visit us",
        headline: "Open Monday–Saturday.",
        body: "16 New Canterbury Road, Petersham NSW 2049. Trade enquiries welcome — call ahead for large orders.",
        button: { label: "Get directions →", href: "https://maps.google.com/?q=16+New+Canterbury+Rd+Petersham+NSW+2049" },
      },
    },
  ];
  await db
    .insert(pages)
    .values({
      slug: "/nursery",
      title: "Nursery — Profile Landscapes",
      lede: "Retail and trade plant sales from our Petersham yard. Advanced trees, specimen plants and groundcovers.",
      sections: nurserySections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoNothing({ target: pages.slug });

  // ---------- Landscape design page ----------
  const legacyDesignSections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }, { label: "Design studio" }],
        title: "Design that",
        titleItalic: "goes all the way.",
        lede: "Concept design through to construction documentation, planting plans and 3D visualisation — all in-house. We use Buildsoft and Cubit for BOQ so the handover to our contracting arm is seamless.",
      },
    },
    {
      type: "pillars",
      props: {
        items: [
          {
            number: "01",
            title: "Concept design",
            body: "Masterplan, schematic layout and precedent imagery. Presented to client, council or DA submission.",
          },
          {
            number: "02",
            title: "Design documentation",
            body: "Planting plans, materials schedules, irrigation schematics and construction details for tender or DA.",
          },
          {
            number: "03",
            title: "3D visualisation",
            body: "Photorealistic renders and fly-through animations. Produced in-house for client approvals and marketing.",
          },
          {
            number: "04",
            title: "BOQ & estimating",
            body: "Buildsoft and Cubit-based cost plans. Because we also build, our estimates are grounded in real supply and labour rates.",
          },
        ],
      },
    },
    {
      type: "two_col",
      props: {
        eyebrow: "Design informed by delivery",
        title: "Drawn by people",
        titleItalic: "who understand the site.",
        body: "Our design team works alongside estimators, project managers, horticulturists and site crews. Details are developed around buildability, procurement, maintenance and programme—not treated as a separate exercise.",
        image: "/assets/projects/fraser-suites-lumiere-restored-v2.webp",
        imageAlt: "Elevated planted terrace at Fraser Suites and Lumiere, Sydney",
      },
    },
    {
      type: "stats",
      props: {
        eyebrow: "Studio outputs",
        items: [
          { value: "01", label: "Concept & masterplans" },
          { value: "02", label: "Planting & irrigation" },
          { value: "03", label: "Construction documentation" },
          { value: "04", label: "BOQ & cost planning" },
        ],
      },
    },
    {
      type: "featured_projects",
      props: {
        eyebrow: "From drawing to delivery",
        title: "Selected built work",
        titleItalic: "by the same team.",
        cta: { label: "View all projects", href: "/projects" },
        limit: 3,
      },
    },
    {
      type: "cta",
      props: {
        eyebrow: "Start a brief",
        headline: "Bring us in early.",
        body: "Design works best when it starts at concept stage. Send us the brief — site plan, program and budget — and we'll come back with a realistic scope.",
        button: { label: "Send us a brief →", href: "/contact" },
      },
    },
  ];
  const designSections: Section[] = [
    { type: "design_studio", props: {} },
  ];
  void legacyDesignSections;

  await db
    .insert(pages)
    .values({
      slug: "/landscape-design",
      title: "Design studio — Profile Landscapes",
      lede: "Concept design, documentation, 3D visualisation and estimating — all in-house.",
      sections: designSections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: pages.slug,
      set: { title: "Design studio — Profile Landscapes", sections: designSections, status: "live", updatedAt: new Date() },
    });

  // ---------- Encyclopedia page ----------
  const encyclopediaSections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }, { label: "Encyclopedia" }],
        title: "Three decades",
        titleItalic: "of field notes.",
        lede: "318 plant entries — the species we specify, grow, install and maintain. Every entry carries our field assessment of hardiness, establishment rate, and commercial viability.",
      },
    },
    {
      type: "stats",
      props: {
        eyebrow: "The collection",
        items: [
          { value: "318", label: "Plant entries" },
          { value: "27yr", label: "Field observations" },
          { value: "12", label: "Categories" },
          { value: "4,800+", label: "In nursery stock" },
        ],
      },
    },
    {
      type: "rich",
      props: {
        html: "<p>The encyclopedia is being transferred from our internal reference system. Full entries — with cultivation notes, commercial viability ratings and site photography — will be published progressively. <a href='/contact'>Register your interest →</a></p>",
      },
    },
  ];
  await db
    .insert(pages)
    .values({
      slug: "/encyclopedia",
      title: "Plant encyclopedia — Profile Landscapes",
      lede: "318 plant entries with field notes on hardiness, establishment and commercial viability.",
      sections: encyclopediaSections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoNothing({ target: pages.slug });

  // ---------- Capability page ----------
  const legacyCapabilitySections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }, { label: "Capability" }],
        title: "A fully-resourced yard,",
        titleItalic: "ready for consequential work.",
        lede: "Our people, plant and software — the scale that lets us self-perform on projects from $20K to $11M without sub-letting.",
      },
    },
    {
      type: "stats",
      props: {
        eyebrow: "The team",
        title: "35 people.",
        items: [
          { value: "1", label: "Landscape Architect" },
          { value: "2", label: "Project Managers" },
          { value: "5", label: "Foremen" },
          { value: "16", label: "Labourers" },
          { value: "6", label: "Tradesmen" },
          { value: "2", label: "Estimators" },
          { value: "2", label: "Apprentices" },
          { value: "1", label: "Office & Accounts" },
        ],
      },
    },
    {
      type: "rich",
      props: {
        html: `<h2>The yard.</h2>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2rem 3rem;margin:2rem 0">
  <div>
    <h4 style="margin:0 0 .75rem;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;opacity:.5">Excavation &amp; civil</h4>
    <ul style="margin:0;padding:0;list-style:none;line-height:2">
      <li>Bobcat &amp; attachments ×5</li><li>Posi-Track loader ×1</li>
      <li>8 tonne excavator ×2</li><li>5 tonne excavator ×1</li>
      <li>3.5 tonne excavator ×2</li><li>1.7 tonne excavator ×2</li>
      <li>1 tonne roller ×1</li>
    </ul>
  </div>
  <div>
    <h4 style="margin:0 0 .75rem;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;opacity:.5">Transport</h4>
    <ul style="margin:0;padding:0;list-style:none;line-height:2">
      <li>10 tonne tipper ×1</li><li>5 tonne tipper ×1</li>
      <li>Supervisor dual cab ×3</li><li>1 tonne utility ×6</li>
      <li>Maintenance van ×2</li><li>Irrigation van ×1</li>
    </ul>
  </div>
  <div>
    <h4 style="margin:0 0 .75rem;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;opacity:.5">Systems &amp; software</h4>
    <ul style="margin:0;padding:0;list-style:none;line-height:2">
      <li>Buildsoft / Cubit (BOQ)</li><li>ACONEX / Procore (PM)</li>
      <li>Teambinder (DMS)</li><li>AutoCAD (CAD)</li>
      <li>Irricad (Irrigation)</li><li>Live cost reporting</li>
    </ul>
  </div>
</div>`,
      },
    },
    {
      type: "two_col",
      props: {
        eyebrow: "Self-performed delivery",
        title: "Plant, people and",
        titleItalic: "project controls.",
        body: "Our company-owned excavation and transport fleet is backed by in-house estimating, live cost reporting, ACONEX, Procore, Teambinder, AutoCAD and Irricad. The result is tighter programme control and fewer hand-offs across consequential landscape packages.",
        image: "/assets/projects/cranbrook-junior-school-restored-v2.webp",
        imageAlt: "Landscape works at Cranbrook Junior School, Rose Bay",
      },
    },
    {
      type: "clients",
      props: {
        eyebrow: "Clients, contractors & design partners",
        title: "Relationships represented in our 2025 company profile.",
        clients: [
          { name: "Lendlease", logo: "/assets/clients/lendlease.png" },
          { name: "CPB Contractors", logo: "/assets/clients/cpb-contractors.png" },
          { name: "Richard Crookes", logo: "/assets/clients/richard-crookes.png" },
          { name: "PERIFA", logo: "/assets/clients/perifa.png" },
          { name: "BESIX Watpac", logo: "/assets/clients/besix-watpac.png" },
          { name: "Taylor Construction", logo: "/assets/clients/taylor-construction.png" },
          { name: "Billbergia", logo: "/assets/clients/billbergia.png" },
          { name: "City of Sydney", logo: "/assets/clients/city-of-sydney.png" },
          { name: "Black Beetle", logo: "/assets/clients/black-beetle.png" },
        ],
      },
    },
    {
      type: "cta",
      props: {
        eyebrow: "Work with us",
        headline: "Have a project we'd suit?",
        headlineItalic: "Invite us to tender.",
        body: "Send us your tender documents or brief. We turn around pricing within five business days.",
        cta: { label: "Request a quote →", href: "/contact" },
      },
    },
  ];
  const capabilitySections: Section[] = [
    { type: "capability_studio", props: {} },
  ];
  void legacyCapabilitySections;

  await db
    .insert(pages)
    .values({
      slug: "/capability",
      title: "Capability — Profile Landscapes",
      lede: "35 people, 22 machines and the software stack — the full in-house capability that lets us self-perform from $20K to $11M.",
      sections: capabilitySections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: pages.slug,
      set: { title: "Capability — Profile Landscapes", sections: capabilitySections, status: "live", updatedAt: new Date() },
    });

  // ---------- Careers page ----------
  const careersSections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }, { label: "Careers" }],
        title: "Build something",
        titleItalic: "that stays.",
        lede: "We're looking for people who care about getting it right — from their first day on a wheelbarrow to running a six-figure site. Apprenticeships, labourers, qualified tradespeople, foremen, horticulturists, office.",
      },
    },
    {
      type: "stats",
      props: {
        eyebrow: "The team",
        items: [
          { value: "27", label: "On payroll" },
          { value: "9", label: "Apprentices trained" },
          { value: "14yr", label: "Average tenure" },
          { value: "1999", label: "Year founded" },
        ],
      },
    },
    {
      type: "pillars",
      props: {
        eyebrow: "Growth pathway",
        title: "First job to",
        titleItalic: "leading hand — we've done it nine times.",
        items: [
          {
            number: "01",
            title: "Apprentice / labourer",
            body: "On-site from week one. White card + TAFE Cert III Landscape Construction funded. Rotated across soft works, hardscape and irrigation so you see everything. Year 1–2.",
          },
          {
            number: "02",
            title: "Qualified tradesperson",
            body: "Running small elements independently. Tool allowance, ute option, specialisation encouraged in horticulture, paving or water features. Year 3–5.",
          },
          {
            number: "03",
            title: "Leading hand",
            body: "Small crew leadership. Reading drawings, setting out, subbie coordination. First-aid and traffic control tickets covered by us. Year 5–8.",
          },
          {
            number: "04",
            title: "Site foreman",
            body: "Full site ownership. ACONEX / Procore / programme management. We back your Cert IV / Diploma / builder's licence. Year 8+.",
          },
        ],
      },
    },
    {
      type: "rich",
      props: {
        html: `<h2>Open roles <em style="opacity:.45;font-size:.7em;font-style:normal;font-weight:400;margin-left:.5rem">7 positions</em></h2>
<table style="width:100%;border-collapse:collapse;font-size:.9375rem">
  <thead><tr style="border-bottom:2px solid var(--accent)">
    <th style="text-align:left;padding:.5rem .75rem .5rem 0;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;opacity:.5">Role</th>
    <th style="text-align:left;padding:.5rem .75rem;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;opacity:.5">Location</th>
    <th style="text-align:left;padding:.5rem .75rem;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;opacity:.5">Start</th>
    <th style="text-align:left;padding:.5rem 0 .5rem .75rem;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;opacity:.5">Positions</th>
  </tr></thead>
  <tbody>
    <tr style="border-bottom:1px solid var(--bone)"><td style="padding:.75rem .75rem .75rem 0">Landscape apprentice — Cert III</td><td style="padding:.75rem">Sydney-wide</td><td style="padding:.75rem">Feb 2026</td><td style="padding:.75rem 0 .75rem .75rem">4</td></tr>
    <tr style="border-bottom:1px solid var(--bone)"><td style="padding:.75rem .75rem .75rem 0">Horticulture apprentice — nursery</td><td style="padding:.75rem">Petersham</td><td style="padding:.75rem">Feb 2026</td><td style="padding:.75rem 0 .75rem .75rem">1</td></tr>
    <tr style="border-bottom:1px solid var(--bone)"><td style="padding:.75rem .75rem .75rem 0">Experienced landscape labourer</td><td style="padding:.75rem">Sydney-wide</td><td style="padding:.75rem">ASAP</td><td style="padding:.75rem 0 .75rem .75rem">2</td></tr>
    <tr style="border-bottom:1px solid var(--bone)"><td style="padding:.75rem .75rem .75rem 0">Landscape carpenter / chippy</td><td style="padding:.75rem">Sydney-wide</td><td style="padding:.75rem">ASAP</td><td style="padding:.75rem 0 .75rem .75rem">1</td></tr>
    <tr style="border-bottom:1px solid var(--bone)"><td style="padding:.75rem .75rem .75rem 0">Site foreman — commercial</td><td style="padding:.75rem">Inner / west Sydney</td><td style="padding:.75rem">Mar 2026</td><td style="padding:.75rem 0 .75rem .75rem">1</td></tr>
    <tr style="border-bottom:1px solid var(--bone)"><td style="padding:.75rem .75rem .75rem 0">Assistant site foreman</td><td style="padding:.75rem">Sydney-wide</td><td style="padding:.75rem">ASAP</td><td style="padding:.75rem 0 .75rem .75rem">1</td></tr>
    <tr><td style="padding:.75rem .75rem .75rem 0">Contracts administrator</td><td style="padding:.75rem">Petersham</td><td style="padding:.75rem">ASAP</td><td style="padding:.75rem 0 .75rem .75rem">1</td></tr>
  </tbody>
</table>`,
      },
    },
    {
      type: "pillars",
      props: {
        eyebrow: "Why people stay",
        title: "Eight things",
        titleItalic: "we do differently.",
        items: [
          { number: "01", title: "Tickets on us", body: "White card, first aid, traffic control, confined space, chainsaw. Paid training days — not your weekends." },
          { number: "02", title: "Tool allowance", body: "Annual tool allowance for trades. PPE fully supplied from day one." },
          { number: "03", title: "TAFE supported", body: "Paid TAFE day, fees covered for Cert III / IV / Diploma in landscape, horticulture, arboriculture." },
          { number: "04", title: "Crew rotation", body: "Rotated across crews every 2–6 weeks. New sites, new techniques, less burnout." },
          { number: "05", title: "EAP + mental health", body: "24/7 confidential counselling. Toolbox talks that actually talk about it." },
          { number: "06", title: "Birthday off", body: "Paid leave on your birthday. First week of Christmas shutdown paid for all staff." },
          { number: "07", title: "Nursery discount", body: "40% off plants from our nursery for your own home projects." },
          { number: "08", title: "Pathways in writing", body: "Annual reviews with a clear promotion track written down. No surprises, no verbal promises." },
        ],
      },
    },
    {
      type: "cta",
      props: {
        eyebrow: "Apply",
        headline: "Ready to join the yard?",
        headlineItalic: "We read every application.",
        body: "Send us your CV and a brief note about the role you're after. We'll come back to you within two business days.",
        cta: { label: "Send your CV →", href: "/contact" },
      },
    },
  ];
  await db
    .insert(pages)
    .values({
      slug: "/careers",
      title: "Careers — Profile Landscapes",
      lede: "Apprenticeships, trades, foremen and office roles in Sydney's leading commercial landscape practice.",
      sections: careersSections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoNothing({ target: pages.slug });

  // ---------- Terms of trade ----------
  const termsSections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }, { label: "Legal" }, { label: "Terms of trade" }],
        title: "Terms of",
        titleItalic: "trade.",
        lede: "The terms on which we supply contracting services, design work and nursery goods. These govern every engagement unless superseded in writing by a head contract.",
      },
    },
    {
      type: "rich",
      props: {
        html: `<p style="font-size:.875rem;opacity:.55;margin-bottom:2.5rem">Effective: 1 January 2026 &nbsp;·&nbsp; Version 6.0 &nbsp;·&nbsp; Governing law: NSW, Australia</p>

<h2>01 — Parties &amp; scope</h2>
<p>These terms form a binding agreement between Profile Landscapes (NSW) Pty Ltd (ACN 087 195 122, "Profile") and the client. They cover contracting services, design services, nursery sales and any incidental goods. Where a head contract (AS 4300, AS 2124, or a custom instrument) has been executed, it supersedes these terms to the extent of any inconsistency.</p>

<h2>02 — Quotes &amp; acceptance</h2>
<p>All quotes are valid for 30 days. Prices are in AUD and exclude GST unless stated. Acceptance occurs on: (a) client countersigning the quotation; (b) payment of deposit; or (c) Profile commencing work with client's knowledge.</p>

<h2>03 — Deposits &amp; payment</h2>
<ol>
  <li>Deposit: 20% on acceptance for works over $10,000; 50% for specialist imports or custom stone.</li>
  <li>Progress claims: monthly, on the 25th, against agreed milestones.</li>
  <li>Final payment: due 14 days from practical completion or date of invoice, whichever is later.</li>
  <li>Nursery sales: paid in full before dispatch or collection.</li>
</ol>
<p>Overdue invoices accrue interest at 1.5% per month. Works may be suspended until the balance is current.</p>

<h2>04 — Delivery &amp; timing</h2>
<p>Delivery dates are estimates. Profile accepts no liability for consequential loss arising from weather, industrial action, approval delays, unforeseen site conditions, or delays caused by the client or other trades.</p>

<h2>05 — Variations</h2>
<p>All variations are priced and agreed in writing before proceeding. Verbal instructions are confirmed in writing within 48 hours. The client's failure to object within 5 business days constitutes acceptance.</p>

<h2>06 — Warranty &amp; aftercare</h2>
<p>Workmanship is warranted for 12 months from practical completion. The warranty does not cover damage from subsequent trades, misuse, vandalism, weather events, or failure to follow the aftercare schedule.</p>
<blockquote>We strongly recommend our 12-month aftercare package for new plantings — it keeps your warranty active and ensures the planting establishes properly.</blockquote>

<h2>07 — Plants &amp; live goods</h2>
<p>Plants are warranted as true to name, healthy, and in the stated grade at point of supply. Warranty on established plants is limited to replacement of stock demonstrably defective at supply. Advanced and specialist stock is sold as-inspected.</p>

<h2>08 — Insurance &amp; risk</h2>
<p>Profile carries $20 million public liability, $5 million product liability, and workers' compensation for all staff. Certificates of currency are available on request. Risk passes on delivery; title passes on full payment.</p>

<h2>09 — Disputes</h2>
<p>Contact Carlo Capogreco on (02) 9568 5868 or director@profilelandscapes.com.au directly. If unresolved within 21 days, either party may refer the matter to NSW Fair Trading Building Disputes or Resolution Institute mediation. These terms are governed by the laws of New South Wales.</p>
<blockquote>Questions before you sign? Call the studio. We'd rather explain a clause than have you guess at one.</blockquote>`,
      },
    },
  ];
  await db
    .insert(pages)
    .values({
      slug: "/terms",
      title: "Terms of trade — Profile Landscapes",
      lede: "The terms on which Profile Landscapes supplies contracting, design and nursery services. Effective 1 January 2026.",
      sections: termsSections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoNothing({ target: pages.slug });

  // ---------- Privacy policy ----------
  const privacySections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }, { label: "Legal" }, { label: "Privacy policy" }],
        title: "Privacy",
        titleItalic: "policy.",
        lede: "How Profile Landscapes (NSW) Pty Ltd collects, uses, discloses and protects your personal information, in accordance with the Australian Privacy Principles.",
      },
    },
    {
      type: "rich",
      props: {
        html: `<p style="font-size:.875rem;opacity:.55;margin-bottom:2.5rem">Effective: 1 January 2026 &nbsp;·&nbsp; Version 4.2 &nbsp;·&nbsp; Australian Privacy Principles compliant</p>

<h2>01 — Who we are</h2>
<p>Profile Landscapes (NSW) Pty Ltd (ACN 087 195 122) is a commercial landscape contracting business, retail and trade nursery, and design studio at 16 New Canterbury Road, Petersham NSW 2049. This policy applies to our website, physical premises, tender and estimation processes, and all client and supplier relationships.</p>

<h2>02 — What we collect</h2>
<h3>If you enquire about work</h3>
<ul><li>Name, company, job title and contact details</li><li>Project address and site details (including access notes)</li><li>Brief, budget indication and preferred timing</li><li>Any correspondence, tender documents and drawings you send us</li></ul>
<h3>If you buy from our nursery</h3>
<ul><li>Delivery address and billing details</li><li>Order history and plant selections (to support re-ordering and warranty claims)</li><li>Payment method tokens — full card details are stored only by our PCI-compliant processor, Stripe</li></ul>
<h3>If you apply for a role</h3>
<ul><li>Your CV, portfolio and right-to-work evidence</li><li>Referee contact details you provide</li><li>Interview notes and assessment outcomes</li></ul>
<h3>If you visit our website</h3>
<ul><li>Anonymised analytics (pages visited, device type, approximate location)</li><li>Information submitted through contact or enquiry forms</li></ul>

<h2>03 — How we use your information</h2>
<p>We use your information to respond to enquiries, prepare tenders, deliver contracted works, fulfil orders, communicate about ongoing projects, comply with legal obligations (WHS, tax, employment law), and — where opted in — inform you about new projects, seasonal nursery releases or open roles.</p>
<blockquote>We do not sell personal information. We do not use your information for automated decision-making or profiling that has legal or similarly significant effects.</blockquote>

<h2>04 — Who we share information with</h2>
<ul>
  <li>Principal contractors, project managers and consultants on your project</li>
  <li>Subcontractors (paving, irrigation, arboriculture, earthworks) under written confidentiality</li>
  <li>IT providers (Google Workspace, Xero, Stripe, Sendle) hosting data on our behalf</li>
  <li>Government agencies and regulators where legally required</li>
</ul>
<p>No transfer of data outside Australia, except through the normal operation of the named cloud services.</p>

<h2>05 — Cookies &amp; analytics</h2>
<p>We use essential cookies for session management and anonymised analytics cookies (Plausible). We do not use advertising cookies or cross-site trackers.</p>

<h2>06 — Storage &amp; security</h2>
<p>Data is stored on Australian-hosted instances of Google Workspace, Xero, and our CMS database. Physical files are locked at our Petersham office and destroyed once retention obligations expire — typically 7 years for financial records, 3 years for enquiries. Access is limited to staff who need it, and all staff sign confidentiality undertakings.</p>

<h2>07 — Your rights</h2>
<p>Under the Australian Privacy Principles you may:</p>
<ul>
  <li>Ask us what personal information we hold about you</li>
  <li>Ask us to correct information that is inaccurate</li>
  <li>Ask us to delete information we no longer need</li>
  <li>Withdraw consent for marketing communications at any time</li>
  <li>Make a complaint to the Office of the Australian Information Commissioner (oaic.gov.au) if we've mishandled your information</li>
</ul>

<h2>08 — Contact us</h2>
<blockquote>Carlo Capogreco, Director<br>Profile Landscapes (NSW) Pty Ltd<br>16 New Canterbury Road, Petersham NSW 2049<br>privacy@profilelandscapes.com.au &nbsp;·&nbsp; (02) 9568 5868<br><em>We respond within 14 days, always within the 30-day statutory window.</em></blockquote>`,
      },
    },
  ];
  await db
    .insert(pages)
    .values({
      slug: "/privacy",
      title: "Privacy policy — Profile Landscapes",
      lede: "How we collect, use and protect your personal information. Australian Privacy Principles compliant.",
      sections: privacySections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoNothing({ target: pages.slug });

  // ---------- Thank-you page ----------
  const thankyouSections: Section[] = [
    {
      type: "page_head",
      props: {
        crumbs: [{ label: "Home", href: "/" }],
        title: "Thank",
        titleItalic: "you.",
        lede: "Your brief is in Carlo's inbox. We read every one personally — you'll hear back within two business days, usually sooner.",
      },
    },
    {
      type: "two_col",
      props: {
        eyebrow: "While you wait",
        title: "Have a look at",
        titleItalic: "our recent work.",
        body: "Browse the portfolio to see projects similar to yours — sector, scale and scope. Or explore the plant encyclopedia Carlo has curated over the last three decades.",
        cta: { label: "Browse projects →", href: "/projects" },
        aside: "Something urgent? Call the studio directly on (02) 9568 5868 — we're at the yard Monday to Saturday, 7am to 4pm.",
      },
    },
  ];
  await db
    .insert(pages)
    .values({
      slug: "/thank-you",
      title: "Thank you — Profile Landscapes",
      lede: "Enquiry received.",
      sections: thankyouSections,
      status: "live",
      publishedAt: new Date(),
    })
    .onConflictDoNothing({ target: pages.slug });

  // ---------- Commerce: Product categories ----------
  const cats = [
    { slug: "workwear", name: "Workwear & Hi-Vis", description: "Site-ready workwear built for outdoor professionals.", sortOrder: 0 },
    { slug: "hand-tools", name: "Hand Tools", description: "Quality hand tools trusted on our own projects.", sortOrder: 1 },
    { slug: "safety", name: "Safety & PPE", description: "Gloves, glasses, hearing protection and more.", sortOrder: 2 },
    { slug: "household", name: "Garden & Household", description: "Kits and equipment for home garden maintenance.", sortOrder: 3 },
  ];
  for (const cat of cats) {
    await db
      .insert(productCategories)
      .values({ ...cat, status: "live" })
      .onConflictDoUpdate({
        target: productCategories.slug,
        set: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      });
  }

  // Get category IDs for linking
  const catRows = await db.select().from(productCategories);
  const catId = (slug: string) => catRows.find((c) => c.slug === slug)?.id ?? null;

  // ---------- Commerce: Products ----------
  const productList = [
    {
      slug: "day-night-hi-vis-polo",
      sku: "WW-001",
      name: "Day/Night Hi-Vis Polo",
      categorySlug: "workwear",
      priceCents: 7800,
      compareAtCents: null,
      badge: "NEW",
      shortDescription: "ANSI/ISEA 107 Class 2 compliant hi-vis polo. Moisture-wicking fabric, segmented tape, pen pocket.",
      description: "Engineered for outdoor professionals working in mixed light conditions. Meets AS/NZS 4602.1:2011 Class D/N requirements. Quick-dry polyester with underarm venting.",
      stockQty: 150,
      featured: true,
    },
    {
      slug: "felco-8-secateurs",
      sku: "HT-001",
      name: "Felco #8 Secateurs",
      categorySlug: "hand-tools",
      priceCents: 12900,
      compareAtCents: null,
      badge: "BEST",
      shortDescription: "The landscaper's secateur. Swiss-made, lifetime-serviceable, ambidextrous.",
      description: "FELCO 8 is our most-recommended tool for general landscaping. Rotating handle reduces hand fatigue by up to 30%. All parts replaceable.",
      stockQty: 48,
      featured: true,
    },
    {
      slug: "tradesman-leather-gloves",
      sku: "SA-001",
      name: "Tradesman Leather Gloves",
      categorySlug: "safety",
      priceCents: 3400,
      compareAtCents: 4200,
      badge: "SALE",
      shortDescription: "Grain leather palm, stretch knit back. EN 388 rated. Sizes S–2XL.",
      description: "Full-grain cowhide palm with stretch-knit dorsal for all-day comfort. Reinforced thumb crotch and fingertips. Machine washable.",
      stockQty: 200,
      featured: true,
    },
    {
      slug: "raised-bed-starter-kit",
      sku: "HH-001",
      name: "Raised Bed Starter Kit",
      categorySlug: "household",
      priceCents: 24500,
      compareAtCents: null,
      badge: null,
      shortDescription: "Everything to build a 1.2m × 0.6m raised bed: treated pine planks, corner brackets, weed mat, soil mixture guide.",
      description: "Our nursery team's preferred setup for herbs and annual vegetables. Timber pre-cut, pre-drilled. Assembly under 30 minutes with basic tools.",
      stockQty: 24,
      featured: false,
    },
    {
      slug: "waterproof-site-jacket",
      sku: "WW-002",
      name: "Waterproof Site Jacket",
      categorySlug: "workwear",
      priceCents: 18900,
      compareAtCents: null,
      badge: null,
      shortDescription: "10,000mm waterproof rating, taped seams, fleece-lined collar. Meets AS 3765.",
      description: "Purpose-built for outdoor site work in Australian conditions. Two chest pockets, two hand pockets, adjustable hem and cuffs. Machine washable.",
      stockQty: 60,
      featured: false,
    },
    {
      slug: "round-mouth-shovel",
      sku: "HT-002",
      name: "Round-Mouth Shovel",
      categorySlug: "hand-tools",
      priceCents: 6800,
      compareAtCents: null,
      badge: null,
      shortDescription: "Fibreglass handle, boron steel blade, 1.2m overall. The go-to digging shovel on our sites.",
      description: "Boron steel blade heat-treated to Rockwell C50 hardness. Cushion grip fibreglass handle rated to 150kg. Lifetime anti-corrosion coating.",
      stockQty: 35,
      featured: false,
    },
    {
      slug: "safety-glasses-tinted",
      sku: "SA-002",
      name: "Safety Glasses — Tinted",
      categorySlug: "safety",
      priceCents: 2200,
      compareAtCents: null,
      badge: null,
      shortDescription: "AS/NZS 1337 rated, wraparound UV400, anti-scratch lens.",
      description: "Lightweight 28g frame, adjustable temples, side shield coverage. Suitable over prescription glasses. Meets ANSI Z87.1.",
      stockQty: 300,
      featured: false,
    },
    {
      slug: "garden-kneeler-padded",
      sku: "HH-002",
      name: "Garden Kneeler — Padded",
      categorySlug: "household",
      priceCents: 3900,
      compareAtCents: null,
      badge: null,
      shortDescription: "50mm memory foam, waterproof PVC cover, folds flat. 90kg rated.",
      description: "High-density memory foam distributes pressure evenly. Integrated carry handle. Wipes clean. A staple for planting and weeding sessions.",
      stockQty: 80,
      featured: false,
    },
    {
      slug: "bypass-loppers-telescopic",
      sku: "HT-003",
      name: "Bypass Loppers — Telescopic",
      categorySlug: "hand-tools",
      priceCents: 9400,
      compareAtCents: null,
      badge: null,
      shortDescription: "Extends 65–95cm, cuts up to 50mm dia. SK5 steel blade, non-stick coating.",
      description: "Telescoping aluminium handles reduce weight by 40% vs. fixed loppers. Compound action mechanism multiplies cutting force. Replaceable blade.",
      stockQty: 28,
      featured: false,
    },
    {
      slug: "work-pants-cargo-cut",
      sku: "WW-003",
      name: "Work Pants — Cargo Cut",
      categorySlug: "workwear",
      priceCents: 9400,
      compareAtCents: null,
      badge: null,
      shortDescription: "Cotton/poly blend, 8 pockets including tool pocket. Reinforced knees. Sizes 77–117 waist.",
      description: "300gsm twill weave built for Australian conditions. Cordura-reinforced knees, triple-stitched seams at stress points. Machine washable.",
      stockQty: 120,
      featured: false,
    },
    {
      slug: "hearing-protection-27db",
      sku: "SA-003",
      name: "Hearing Protection — 27dB",
      categorySlug: "safety",
      priceCents: 4800,
      compareAtCents: null,
      badge: null,
      shortDescription: "Class 5 (27dB SLC80), foldable, padded cushions. AS/NZS 1270 rated.",
      description: "Folds flat for pocket storage. Adjustable stainless steel headband. Replaceable cushions and cups available separately.",
      stockQty: 75,
      featured: false,
    },
    {
      slug: "tool-roll-12-pocket",
      sku: "HH-003",
      name: "Tool Roll — 12-Pocket",
      categorySlug: "household",
      priceCents: 6800,
      compareAtCents: 8600,
      badge: "SALE",
      shortDescription: "Waxed canvas, leather trim, 12 pockets, tie closure. 45cm × 32cm unrolled.",
      description: "Heavy-duty 12oz waxed canvas ages beautifully. Leather strap closure, D-ring for hanging. Fits pruning shears, trowels, hand forks.",
      stockQty: 40,
      featured: false,
    },
  ];

  for (const p of productList) {
    const { categorySlug, ...vals } = p;
    const categoryImages: Record<string, Array<{ url: string; alt: string }>> = {
      workwear: [{ url: "/assets/generated/shop-workwear.webp", alt: `${vals.name} - professional landscape workwear` }],
      "hand-tools": [{ url: "/assets/generated/shop-tools.webp", alt: `${vals.name} - professional landscape hand tools` }],
      safety: [{ url: "/assets/generated/shop-gloves.webp", alt: `${vals.name} - landscape safety equipment` }],
      household: [{ url: "/assets/generated/shop-home-garden.webp", alt: `${vals.name} - garden and household equipment` }],
    };
    const images = categoryImages[categorySlug] || [];
    await db
      .insert(products)
      .values({ ...vals, images, categoryId: catId(categorySlug), status: "live" })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: vals.name,
          priceCents: vals.priceCents,
          compareAtCents: vals.compareAtCents,
          badge: vals.badge,
          stockQty: vals.stockQty,
          shortDescription: vals.shortDescription,
          description: vals.description,
          featured: vals.featured,
          images,
          categoryId: catId(categorySlug),
        },
      });
  }

  // ---------- Nursery: Plant stock ----------
  const plantList = [
    {
      slug: "lomandra-longifolia-tanika",
      latinName: "Lomandra longifolia 'Tanika'",
      commonName: "Mat Rush",
      family: "Asparagaceae",
      priceCents: 1850,
      size: "200mm pot",
      stockQty: 240,
      tags: ["NATIVE", "DROUGHT"],
      shortDescription: "Dense, arching grass-like foliage. Extremely hardy. Ideal for mass planting, slopes and roadsides.",
      care: { water: "Low — once established", light: "Full sun to part shade", soil: "Any well-drained", growthRate: "Moderate", matureSize: "0.6m H × 0.8m W" },
      seasons: { flowering: [10, 11, 12] },
      featured: true,
    },
    {
      slug: "westringia-fruticosa-smokey",
      latinName: "Westringia fruticosa 'Smokey'",
      commonName: "Variegated Native Rosemary",
      family: "Lamiaceae",
      priceCents: 1950,
      size: "200mm pot",
      stockQty: 180,
      tags: ["NATIVE", "DROUGHT"],
      shortDescription: "Silver-green variegated foliage. Compact, tidy habit. Excellent low-maintenance hedge or border plant.",
      care: { water: "Low — very drought hardy", light: "Full sun", soil: "Well-drained, sandy loam", growthRate: "Moderate", matureSize: "1.0m H × 1.0m W" },
      seasons: { flowering: [8, 9, 10, 11] },
      featured: true,
    },
    {
      slug: "syzygium-australe-resilience",
      latinName: "Syzygium australe 'Resilience'",
      commonName: "Lillypilly",
      family: "Myrtaceae",
      priceCents: 9500,
      size: "45L bag",
      stockQty: 30,
      tags: ["NATIVE"],
      shortDescription: "Fast-growing screening tree. Glossy foliage, pink new growth, red berries. Highly resistant to psyllid.",
      care: { water: "Moderate — once established", light: "Full sun to part shade", soil: "Moist, well-drained", growthRate: "Fast", matureSize: "3m H × 1.5m W" },
      seasons: { flowering: [12, 1], fruiting: [2, 3, 4] },
      featured: true,
    },
    {
      slug: "dianella-caerulea-breeze",
      latinName: "Dianella caerulea 'Breeze'",
      commonName: "Blue Flax Lily",
      family: "Asphodelaceae",
      priceCents: 1250,
      size: "140mm pot",
      stockQty: 320,
      tags: ["NATIVE", "DROUGHT"],
      shortDescription: "Compact blue-green strappy foliage. Delicate blue flowers, purple berries. Great groundcover in dry conditions.",
      care: { water: "Low", light: "Full sun to full shade", soil: "Any", growthRate: "Moderate", matureSize: "0.5m H × 0.5m W" },
      seasons: { flowering: [9, 10, 11], fruiting: [12, 1, 2] },
      featured: false,
    },
    {
      slug: "anigozanthos-bush-ranger",
      latinName: "Anigozanthos 'Bush Ranger'",
      commonName: "Kangaroo Paw",
      family: "Haemodoraceae",
      priceCents: 2200,
      size: "200mm pot",
      stockQty: 85,
      tags: ["NATIVE", "DROUGHT"],
      shortDescription: "Vivid red and gold flowers on tall stems. Eye-catching feature plant for dry gardens and hot spots.",
      care: { water: "Low", light: "Full sun", soil: "Sandy, well-drained", growthRate: "Moderate", matureSize: "0.6m H × 0.5m W" },
      seasons: { flowering: [9, 10, 11, 12, 1] },
      featured: false,
    },
    {
      slug: "banksia-integrifolia",
      latinName: "Banksia integrifolia",
      commonName: "Coast Banksia",
      family: "Proteaceae",
      priceCents: 12000,
      size: "45L bag",
      stockQty: 12,
      tags: ["NATIVE"],
      shortDescription: "Iconic coastal tree with yellow flower cones attractive to honeyeaters. Wind and salt tolerant.",
      care: { water: "Low — once established", light: "Full sun", soil: "Sandy, well-drained", growthRate: "Moderate", matureSize: "4m H × 2m W" },
      seasons: { flowering: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2] },
      featured: false,
    },
    {
      slug: "grevillea-peaches-and-cream",
      latinName: "Grevillea 'Peaches & Cream'",
      commonName: "Grevillea",
      family: "Proteaceae",
      priceCents: 3800,
      size: "300mm pot",
      stockQty: 60,
      tags: ["NATIVE", "DROUGHT"],
      shortDescription: "Masses of apricot-cream spider flowers nearly year-round. Dense, spreading habit. Attracts birds.",
      care: { water: "Low — drought hardy", light: "Full sun", soil: "Well-drained", growthRate: "Fast", matureSize: "1.5m H × 2m W" },
      seasons: { flowering: [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6] },
      featured: true,
    },
    {
      slug: "ficus-microcarpa-hillii",
      latinName: "Ficus microcarpa 'Hillii'",
      commonName: "Weeping Fig",
      family: "Moraceae",
      priceCents: 45000,
      size: "tree bag",
      stockQty: 5,
      tags: [],
      shortDescription: "Elegant screening and shade tree with pendulous branches. Suited to large spaces and commercial landscapes.",
      care: { water: "Moderate", light: "Full sun to part shade", soil: "Deep, moist", growthRate: "Fast", matureSize: "6m+ H" },
      seasons: {},
      featured: false,
    },
    {
      slug: "pittosporum-tenuifolium",
      latinName: "Pittosporum tenuifolium",
      commonName: "Silver Sheen",
      family: "Pittosporaceae",
      priceCents: 8500,
      size: "45L bag",
      stockQty: 25,
      tags: [],
      shortDescription: "Silver-green foliage, fast-growing hedge and screening plant. Ideal for formal and contemporary gardens.",
      care: { water: "Moderate", light: "Full sun to part shade", soil: "Well-drained", growthRate: "Fast", matureSize: "4m H × 1m W" },
      seasons: { flowering: [10, 11] },
      featured: false,
    },
    {
      slug: "agave-attenuata",
      latinName: "Agave attenuata",
      commonName: "Foxtail Agave",
      family: "Asparagaceae",
      priceCents: 6800,
      size: "300mm pot",
      stockQty: 40,
      tags: ["DROUGHT"],
      shortDescription: "Soft blue-green rosette with no sharp spines. A landscape staple for dry Mediterranean and coastal gardens.",
      care: { water: "Very low — extremely drought hardy", light: "Full sun to part shade", soil: "Sandy, well-drained", growthRate: "Slow", matureSize: "1m H × 1.5m W" },
      seasons: {},
      featured: false,
    },
    {
      slug: "strelitzia-reginae",
      latinName: "Strelitzia reginae",
      commonName: "Bird of Paradise",
      family: "Strelitziaceae",
      priceCents: 11000,
      size: "45L bag",
      stockQty: 18,
      tags: [],
      shortDescription: "Dramatic orange and blue flowers. Bold tropical character for containers and feature planting.",
      care: { water: "Low to moderate", light: "Full sun to part shade", soil: "Well-drained", growthRate: "Slow to moderate", matureSize: "1.8m H × 1.2m W" },
      seasons: { flowering: [6, 7, 8, 9, 10, 11] },
      featured: false,
    },
    {
      slug: "trachelospermum-jasminoides",
      latinName: "Trachelospermum jasminoides",
      commonName: "Star Jasmine",
      family: "Apocynaceae",
      priceCents: 2200,
      size: "200mm pot",
      stockQty: 160,
      tags: ["FRAGRANT"],
      shortDescription: "Fragrant white star-shaped flowers. Versatile climber, groundcover, or espalier. One of the most-used plants in our projects.",
      care: { water: "Low to moderate", light: "Full sun to full shade", soil: "Any well-drained", growthRate: "Moderate to fast", matureSize: "Climber to 6m+ or 30cm groundcover" },
      seasons: { flowering: [10, 11, 12] },
      featured: true,
    },
  ];

  for (const p of plantList) {
    await db
      .insert(plants)
      .values({ ...p, status: "live" })
      .onConflictDoUpdate({
        target: plants.slug,
        set: {
          priceCents: p.priceCents,
          stockQty: p.stockQty,
          size: p.size,
          shortDescription: p.shortDescription,
          care: p.care,
          seasons: p.seasons,
          featured: p.featured,
          tags: p.tags,
        },
      });
  }

  // ---------- Encyclopedia: Plant reference entries ----------
  // Mirrors nursery stock + additional species for the reference database
  const encyclopediaList = [
    {
      slug: "lomandra-longifolia",
      latinName: "Lomandra longifolia",
      commonName: "Mat Rush",
      family: "Asparagaceae",
      genus: "Lomandra",
      description: "One of Australia's most versatile native grass-like plants. Widely used in revegetation, erosion control and landscape planting. Extremely adaptable to harsh conditions including waterlogging, drought and salt spray. Produces fragrant cream-yellow flower spikes in spring.",
      climateZones: ["temperate", "subtropical", "coastal"],
      tags: ["NATIVE", "DROUGHT"],
      care: { water: "Low — very drought tolerant once established", light: "Full sun to full shade", soil: "Any well-drained to poorly-drained", growthRate: "Moderate", matureSize: "0.5–0.9m H × 0.6–1.0m W" },
      seasons: { flowering: [9, 10, 11, 12] },
      companions: ["dianella-caerulea", "westringia-fruticosa", "anigozanthos-flavidus"],
      pestNotes: "Generally pest-free. Occasionally attacked by scale — treat with horticultural oil.",
      propagation: "Seed (sow fresh, germination in 3–6 weeks) or division of established clumps in autumn.",
      landscapeUse: "Mass planting, erosion control, road batters, riparian revegetation, low-maintenance borders, fire-resistant plantings.",
      featured: true,
    },
    {
      slug: "westringia-fruticosa",
      latinName: "Westringia fruticosa",
      commonName: "Native Rosemary / Coastal Rosemary",
      family: "Lamiaceae",
      genus: "Westringia",
      description: "An Australian native shrub with fine grey-green foliage resembling rosemary. Produces small white to pale lilac flowers through spring and summer. One of the most adaptable native shrubs, tolerating coastal salt wind, drought, light frost and a wide range of soils.",
      climateZones: ["temperate", "coastal", "mediterranean"],
      tags: ["NATIVE", "DROUGHT"],
      care: { water: "Low", light: "Full sun", soil: "Any well-drained, including sand and clay", growthRate: "Moderate", matureSize: "1.0–2.0m H × 1.0–2.0m W" },
      seasons: { flowering: [8, 9, 10, 11, 12] },
      companions: ["lomandra-longifolia", "grevillea-peaches-and-cream", "dianella-caerulea"],
      pestNotes: "Rarely troubled by pests. May get scale in humid conditions — hosing off is usually sufficient.",
      propagation: "Semi-hardwood tip cuttings in summer, or seed in spring.",
      landscapeUse: "Hedging, windbreaks, coastal gardens, road medians, low water gardens.",
      featured: true,
    },
    {
      slug: "syzygium-australe",
      latinName: "Syzygium australe",
      commonName: "Brush Cherry / Lillypilly",
      family: "Myrtaceae",
      genus: "Syzygium",
      description: "A fast-growing native tree with glossy foliage and showy pink-red new growth. Produces masses of edible berries that attract birds. Widely used as a formal hedge, screen or feature tree. The 'Resilience' cultivar is resistant to the disfiguring psyllid pest that affects other varieties.",
      climateZones: ["temperate", "subtropical"],
      tags: ["NATIVE"],
      care: { water: "Moderate", light: "Full sun to part shade", soil: "Moist, well-drained, slightly acidic", growthRate: "Fast", matureSize: "3–15m H (cultivar dependent)" },
      seasons: { flowering: [11, 12, 1], fruiting: [2, 3, 4, 5] },
      companions: ["trachelospermum-jasminoides", "pittosporum-tenuifolium", "lomandra-longifolia"],
      pestNotes: "Standard species susceptible to psyllid (tiny insects causing leaf pimples). Use 'Resilience' or 'Select Form' cultivars for resistance. Treat with systemic insecticide if needed.",
      propagation: "Seed (sow fresh — viability drops quickly) or semi-hardwood cuttings.",
      landscapeUse: "Formal hedges (1–5m), screens, street trees, feature trees, wildlife gardens.",
      featured: false,
    },
    {
      slug: "dianella-caerulea",
      latinName: "Dianella caerulea",
      commonName: "Blue Flax Lily",
      family: "Asphodelaceae",
      genus: "Dianella",
      description: "A graceful native groundcover with blue-green strap-like leaves. Produces delicate blue star flowers followed by striking blue-purple berries. One of the most widely used native groundcovers in Australian landscape design, valued for its adaptability and year-round interest.",
      climateZones: ["temperate", "subtropical", "coastal"],
      tags: ["NATIVE", "DROUGHT"],
      care: { water: "Low", light: "Full sun to deep shade", soil: "Any", growthRate: "Moderate", matureSize: "0.4–0.6m H × 0.4–0.6m W" },
      seasons: { flowering: [9, 10, 11], fruiting: [12, 1, 2, 3] },
      companions: ["lomandra-longifolia", "westringia-fruticosa", "anigozanthos-flavidus"],
      pestNotes: "Essentially pest and disease free.",
      propagation: "Division of clumps in autumn, seed (slow).",
      landscapeUse: "Mass groundcover, understorey planting, erosion control, container planting.",
      featured: false,
    },
    {
      slug: "grevillea-peaches-and-cream",
      latinName: "Grevillea 'Peaches & Cream'",
      commonName: "Grevillea",
      family: "Proteaceae",
      genus: "Grevillea",
      description: "A hybrid grevillea producing masses of apricot-cream spider flowers nearly year-round. Dense, spreading shrub ideal as a low hedge or informal screen. A significant nectar source for honeyeaters and other birds.",
      climateZones: ["temperate", "mediterranean"],
      tags: ["NATIVE", "DROUGHT"],
      care: { water: "Low", light: "Full sun", soil: "Well-drained, low phosphorus", growthRate: "Fast", matureSize: "1.0–1.5m H × 1.5–2.5m W" },
      seasons: { flowering: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      companions: ["lomandra-longifolia", "dianella-caerulea", "anigozanthos-flavidus"],
      pestNotes: "Generally hardy. Avoid high-phosphorus fertilisers which can cause iron deficiency. Root rot possible in wet soils.",
      propagation: "Semi-hardwood cuttings in summer–autumn.",
      landscapeUse: "Low informal hedges, bird gardens, mass planting under trees, fire-retardant gardens.",
      featured: true,
    },
    {
      slug: "trachelospermum-jasminoides",
      latinName: "Trachelospermum jasminoides",
      commonName: "Star Jasmine / Confederate Jasmine",
      family: "Apocynaceae",
      genus: "Trachelospermum",
      description: "One of the most versatile and widely used plants in Australian landscape design. Highly fragrant white star-shaped flowers in late spring. Can be trained as a climber on structures and fences, grown as a dense weed-suppressing groundcover, or shaped as a topiary ball or hedge.",
      climateZones: ["temperate", "subtropical", "mediterranean", "coastal"],
      tags: ["FRAGRANT"],
      care: { water: "Low to moderate", light: "Full sun to full shade", soil: "Any well-drained", growthRate: "Moderate to fast", matureSize: "Climber to 8m+ or 30cm groundcover" },
      seasons: { flowering: [10, 11, 12] },
      companions: ["pittosporum-tenuifolium", "syzygium-australe", "lomandra-longifolia"],
      pestNotes: "Generally trouble-free. Mites possible in hot dry conditions — treat with miticide or insecticidal soap.",
      propagation: "Semi-hardwood cuttings in summer (very easy). Layering.",
      landscapeUse: "Fences, pergolas, espalier, groundcover under trees, topiary, privacy screens, fragrant gardens.",
      featured: true,
    },
    {
      slug: "agave-attenuata",
      latinName: "Agave attenuata",
      commonName: "Foxtail Agave / Soft Agave",
      family: "Asparagaceae",
      genus: "Agave",
      description: "Unlike most agaves, Agave attenuata has soft, spine-free leaves making it safe around children and pets. Produces a spectacular arching flower spike (the 'foxtail') after many years then the main rosette dies, offsetting freely. Essential for dry, contemporary and Mediterranean gardens.",
      climateZones: ["temperate", "mediterranean", "coastal"],
      tags: ["DROUGHT"],
      care: { water: "Very low — extremely drought tolerant", light: "Full sun to part shade", soil: "Sandy, well-drained — hates wet feet", growthRate: "Slow", matureSize: "1.0m H × 1.5m W rosette" },
      seasons: {},
      companions: ["strelitzia-reginae", "pittosporum-tenuifolium"],
      pestNotes: "Virtually pest-free. Avoid heavy clay soils and overwatering — root rot is the main risk.",
      propagation: "Offsets (pups) removed from base of parent plant.",
      landscapeUse: "Dry gardens, Mediterranean style, containers, rock gardens, coastal gardens, low-maintenance estates.",
      featured: false,
    },
    {
      slug: "anigozanthos-flavidus",
      latinName: "Anigozanthos flavidus",
      commonName: "Tall Kangaroo Paw",
      family: "Haemodoraceae",
      genus: "Anigozanthos",
      description: "The tallest and most robust kangaroo paw species. Produces yellow-green flowers on stems to 1.5m. More tolerant of humidity than other kangaroo paws. A significant nectar source for honeyeaters, particularly in winter.",
      climateZones: ["temperate", "mediterranean"],
      tags: ["NATIVE", "DROUGHT"],
      care: { water: "Low", light: "Full sun", soil: "Sandy, well-drained, slightly acidic", growthRate: "Moderate", matureSize: "0.6m foliage H, flower stems to 1.5m" },
      seasons: { flowering: [6, 7, 8, 9, 10, 11] },
      companions: ["lomandra-longifolia", "dianella-caerulea", "grevillea-peaches-and-cream"],
      pestNotes: "Susceptible to ink disease (Phytophthora cinnamomi) in humid areas. Remove and destroy affected plants. Ensure excellent drainage.",
      propagation: "Division of rhizomes in autumn, seed (slow).",
      landscapeUse: "Feature planting, bird-attracting gardens, cut flower production, mass planting.",
      featured: false,
    },
  ];

  for (const e of encyclopediaList) {
    await db
      .insert(encyclopediaEntries)
      .values({ ...e, status: "live" })
      .onConflictDoUpdate({
        target: encyclopediaEntries.slug,
        set: {
          description: e.description,
          care: e.care,
          seasons: e.seasons,
          companions: e.companions,
          pestNotes: e.pestNotes,
          propagation: e.propagation,
          landscapeUse: e.landscapeUse,
          featured: e.featured,
        },
      });
  }

  // Full nursery + encyclopedia catalog (528 plants, 384 species) + product/project extras
  const { seedCatalog } = await import("./seed-catalog");
  await seedCatalog();

  if (releaseVersion) {
    await db.insert(siteSettings).values({ key: "seed_release_version", value: releaseVersion }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: releaseVersion, updatedAt: new Date() },
    });
  }

  console.log("✓ seed complete");
  console.log("   admin login: admin@profilelandscapes.com.au (password shown above if newly created)");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
