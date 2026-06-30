/**
 * Drives the field editor in PageEditor. Each section type the theme
 * supports declares its editable fields here, in plain-language labels
 * the non-technical admin user will see.
 *
 * Adding fields to a section is just: append here + read in the renderer.
 */

export type Field =
  | { key: string; label: string; type: "text"; help?: string; placeholder?: string }
  | { key: string; label: string; type: "textarea"; rows?: number; help?: string; placeholder?: string }
  | { key: string; label: string; type: "image"; help?: string }
  | { key: string; label: string; type: "url"; help?: string }
  | { key: string; label: string; type: "list"; itemFields: Field[]; help?: string }
  | { key: string; label: string; type: "object"; fields: Field[]; help?: string };

export const sectionSchemas: Record<
  string,
  { label: string; description: string; fields: Field[] }
> = {
  hero: {
    label: "Hero",
    description: "Big image + heading at the top of a page.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", help: "Small caps text above the heading." },
      { key: "title", label: "Heading", type: "text" },
      { key: "titleItalic", label: "Heading (italic part)", type: "text", help: "Rendered in italic accent colour." },
      { key: "body", label: "Body", type: "textarea", rows: 3 },
      { key: "image", label: "Background image", type: "image" },
      { key: "imageAlt", label: "Image description (alt text)", type: "text" },
      {
        key: "ctaPrimary",
        label: "Primary button",
        type: "object",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "Link", type: "url" },
        ],
      },
      {
        key: "ctaSecondary",
        label: "Secondary button",
        type: "object",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "Link", type: "url" },
        ],
      },
      {
        key: "badge",
        label: "Corner badge",
        type: "object",
        fields: [
          { key: "value", label: "Value", type: "text", placeholder: "$20K — $11M" },
          { key: "label", label: "Caption", type: "text", placeholder: "Project range" },
        ],
      },
    ],
  },
  pillars: {
    label: "Pillars",
    description: "Four short cards in a row — what you do at a glance.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "titleItalic", label: "Heading (italic part)", type: "text" },
      {
        key: "items",
        label: "Cards",
        type: "list",
        itemFields: [
          { key: "number", label: "Number", type: "text", placeholder: "01" },
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "cta", label: "Link label", type: "text" },
          { key: "href", label: "Link target", type: "url" },
        ],
      },
    ],
  },
  stats: {
    label: "Stats",
    description: "Four large numbers in a row.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      {
        key: "items",
        label: "Stats",
        type: "list",
        itemFields: [
          { key: "value", label: "Value", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
    ],
  },
  cta: {
    label: "Call to action",
    description: "Dark banner with a single button.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body", type: "textarea", rows: 3 },
      {
        key: "button",
        label: "Button",
        type: "object",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "Link", type: "url" },
        ],
      },
    ],
  },
  page_head: {
    label: "Page header",
    description: "Crumb + heading + lede for an interior page.",
    fields: [
      { key: "title", label: "Heading", type: "text" },
      { key: "titleItalic", label: "Heading (italic part)", type: "text" },
      { key: "lede", label: "Lede paragraph", type: "textarea", rows: 3 },
    ],
  },
  two_col: {
    label: "Two-column block",
    description: "Heading + body, optionally with an image.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "body", label: "Body", type: "textarea", rows: 5 },
      { key: "image", label: "Image", type: "image" },
      { key: "imageAlt", label: "Image description", type: "text" },
    ],
  },
  contact_form: {
    label: "Contact form",
    description: "Quote-request form. No editable fields.",
    fields: [],
  },
  project_grid: {
    label: "Project grid",
    description: "Auto-populated from the portfolio. No editable fields.",
    fields: [],
  },
  rich: {
    label: "Rich text",
    description: "Free-form text. Use sparingly — prefer structured sections.",
    fields: [
      { key: "html", label: "HTML body", type: "textarea", rows: 10 },
    ],
  },
  gallery: {
    label: "Image gallery",
    description: "Grid of images.",
    fields: [
      {
        key: "images",
        label: "Images",
        type: "list",
        itemFields: [
          { key: "url", label: "Image URL", type: "image" },
          { key: "alt", label: "Alt text", type: "text" },
          { key: "caption", label: "Caption", type: "text" },
        ],
      },
    ],
  },
  featured_projects: {
    label: "Featured projects",
    description: "Auto-pulls recent portfolio projects into a grid.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "titleItalic", label: "Heading (italic part)", type: "text" },
      { key: "limit", label: "How many to show", type: "text", placeholder: "6" },
      { key: "cta", label: "Link button", type: "object", fields: [
        { key: "label", label: "Label", type: "text" },
        { key: "href", label: "Link", type: "url" },
      ] },
    ],
  },
  nursery_spotlight: {
    label: "Nursery spotlight",
    description: "Dark section promoting the nursery, with plant cards + stats.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "titleItalic", label: "Heading (italic part)", type: "text" },
      { key: "body", label: "Body", type: "textarea", rows: 3 },
      { key: "stats", label: "Stats", type: "list", itemFields: [
        { key: "value", label: "Value", type: "text" },
        { key: "label", label: "Label", type: "text" },
      ] },
      { key: "plants", label: "Plant cards", type: "list", itemFields: [
        { key: "latinName", label: "Botanical name", type: "text" },
        { key: "commonName", label: "Common name", type: "text" },
        { key: "price", label: "Price label", type: "text", placeholder: "From $16.50" },
        { key: "image", label: "Image", type: "image" },
      ] },
      { key: "cta", label: "Primary button", type: "object", fields: [
        { key: "label", label: "Label", type: "text" },
        { key: "href", label: "Link", type: "url" },
      ] },
      { key: "ctaSecondary", label: "Secondary link", type: "object", fields: [
        { key: "label", label: "Label", type: "text" },
        { key: "href", label: "Link", type: "url" },
      ] },
    ],
  },
  clients: {
    label: "Client logos",
    description: "Row of client / builder names or logos.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Caption", type: "text" },
      { key: "clients", label: "Clients", type: "list", itemFields: [
        { key: "name", label: "Name", type: "text" },
        { key: "logo", label: "Logo image (optional)", type: "image" },
      ] },
    ],
  },
  testimonial: {
    label: "Testimonial",
    description: "A single large pull-quote.",
    fields: [
      { key: "quote", label: "Quote", type: "textarea", rows: 4 },
      { key: "attribution", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "company", label: "Company", type: "text" },
    ],
  },
  careers_mini: {
    label: "Careers teaser",
    description: "Two-column careers callout with a role list.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "titleItalic", label: "Heading (italic part)", type: "text" },
      { key: "body", label: "Body", type: "textarea", rows: 3 },
      { key: "cta", label: "Button", type: "object", fields: [
        { key: "label", label: "Label", type: "text" },
        { key: "href", label: "Link", type: "url" },
      ] },
      { key: "roles", label: "Roles", type: "list", itemFields: [
        { key: "title", label: "Role title", type: "text" },
        { key: "type", label: "Type / location", type: "text", placeholder: "Full-time · Site" },
        { key: "href", label: "Link", type: "url" },
      ] },
    ],
  },
  careers_hub: {
    label: "Careers hub",
    description: "Full careers page: pathway, open roles, benefits.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "titleItalic", label: "Heading (italic part)", type: "text" },
      { key: "body", label: "Intro body", type: "textarea", rows: 3 },
      { key: "roles", label: "Open roles", type: "list", itemFields: [
        { key: "title", label: "Title", type: "text" },
        { key: "type", label: "Type", type: "text", help: "apprentice | labourer | foreman | office | trade" },
        { key: "team", label: "Team / location", type: "text" },
        { key: "href", label: "Link", type: "url" },
      ] },
      { key: "pathway", label: "Career pathway stages", type: "list", itemFields: [
        { key: "number", label: "Number", type: "text", placeholder: "01" },
        { key: "title", label: "Stage", type: "text" },
        { key: "time", label: "Timeframe", type: "text" },
        { key: "description", label: "Description", type: "textarea", rows: 2 },
      ] },
      { key: "benefits", label: "Benefits", type: "list", itemFields: [
        { key: "icon", label: "Icon (emoji)", type: "text" },
        { key: "label", label: "Title", type: "text" },
        { key: "detail", label: "Detail", type: "textarea", rows: 2 },
      ] },
    ],
  },
  director_profile: {
    label: "Director profile",
    description: "Portrait + bio, career timeline and awards.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "name", label: "Name", type: "text" },
      { key: "title", label: "Role title", type: "text" },
      { key: "body", label: "Bio", type: "textarea", rows: 6 },
      { key: "image", label: "Portrait image", type: "image" },
      { key: "imageAlt", label: "Image description", type: "text" },
      { key: "timeline", label: "Career timeline", type: "list", itemFields: [
        { key: "year", label: "Year", type: "text" },
        { key: "event", label: "Event", type: "text" },
      ] },
      { key: "awards", label: "Awards", type: "list", itemFields: [
        { key: "year", label: "Year", type: "text" },
        { key: "title", label: "Award", type: "text" },
        { key: "body", label: "Detail", type: "text" },
      ] },
    ],
  },
  service_blocks: {
    label: "Service blocks",
    description: "Detailed list of services with key activities.",
    fields: [
      { key: "services", label: "Services", type: "list", itemFields: [
        { key: "number", label: "Number", type: "text", placeholder: "01" },
        { key: "title", label: "Service title", type: "text" },
        { key: "body", label: "Description", type: "textarea", rows: 3 },
        { key: "team", label: "Team badge", type: "text" },
        { key: "activities", label: "Key activities (one per line)", type: "textarea", rows: 5 },
        { key: "cta", label: "Link", type: "object", fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "Link", type: "url" },
        ] },
      ] },
    ],
  },
  legal_content: {
    label: "Legal content",
    description: "Numbered sections with a sticky table of contents.",
    fields: [
      { key: "sections", label: "Sections", type: "list", itemFields: [
        { key: "heading", label: "Heading", type: "text" },
        { key: "body", label: "Body (paragraphs; '- ' lines become bullets)", type: "textarea", rows: 6 },
      ] },
    ],
  },
};

export const ALL_SECTION_TYPES = Object.keys(sectionSchemas);
