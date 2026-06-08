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
};

export const ALL_SECTION_TYPES = Object.keys(sectionSchemas);
