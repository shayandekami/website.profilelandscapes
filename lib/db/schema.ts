import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  jsonb,
  integer,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * GENERIC, TEMPLATE-AGNOSTIC SCHEMA
 *
 * The CMS stores pages as ordered lists of "sections", each with a `type`
 * (e.g. "hero", "pillars", "gallery") and free-form JSON `props`. Themes
 * decide how to render each type. To add a new theme, no schema changes
 * are required.
 */

// ---------- Enums ----------
export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "editor",
  "designer",
  "nursery",
  "contributor",
]);

export const publishStatusEnum = pgEnum("publish_status", ["draft", "live"]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "new",
  "in_reply",
  "site_visit",
  "won",
  "lost",
  "out_of_scope",
]);

export const projectSectorEnum = pgEnum("project_sector", [
  "residential",
  "commercial",
  "civic",
  "healthcare",
  "hospitality",
  "other",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

// ---------- Users ----------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("editor"),
  avatarInitials: varchar("avatar_initials", { length: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

// ---------- Pages ----------
// One row per CMS-managed page. Body is an ordered array of sections,
// rendered by the active theme.
export const pages = pgTable(
  "pages",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    lede: text("lede"),
    sections: jsonb("sections").$type<Section[]>().notNull().default([]),
    heroImage: varchar("hero_image", { length: 500 }),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: varchar("seo_description", { length: 400 }),
    ogImage: varchar("og_image", { length: 500 }),
    status: publishStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    updatedById: integer("updated_by_id").references(() => users.id),
  },
  (t) => ({
    slugIdx: uniqueIndex("pages_slug_idx").on(t.slug),
  })
);

// ---------- Page revisions ----------
// Every save snapshots the previous sections so an editor can roll back.
export const pageRevisions = pgTable("page_revisions", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  sections: jsonb("sections").$type<Section[]>().notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  lede: text("lede"),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Projects (portfolio) ----------
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    suburb: varchar("suburb", { length: 120 }),
    sector: projectSectorEnum("sector").notNull().default("commercial"),
    principal: varchar("principal", { length: 200 }),
    packageValue: varchar("package_value", { length: 80 }),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    carSpaces: integer("car_spaces"),
    completedAt: timestamp("completed_at"),
    heroImage: varchar("hero_image", { length: 500 }),
    summary: text("summary"),
    body: text("body"), // markdown
    // Sidebar case-study data (optional)
    costBreakdown: jsonb("cost_breakdown")
      .$type<Array<{ label: string; value: string }>>()
      .notNull()
      .default([]), // [{label:"Hardscape",value:"$1.1M"}, ...]
    collaborators: jsonb("collaborators")
      .$type<Array<{ role: string; name: string }>>()
      .notNull()
      .default([]), // [{role:"Architect",name:"..."}, ...]
    featured: boolean("featured").notNull().default(false),
    status: publishStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("projects_slug_idx").on(t.slug),
  })
);

export const projectImages = pgTable("project_images", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 500 }).notNull(),
  alt: varchar("alt", { length: 300 }),
  order: integer("order").notNull().default(0),
});

// ---------- Quotes ----------
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  referenceCode: varchar("reference_code", { length: 20 }).unique(), // e.g. Q-2024-0001
  name: varchar("name", { length: 200 }).notNull(),
  company: varchar("company", { length: 200 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  sector: varchar("sector", { length: 60 }),
  budget: varchar("budget", { length: 60 }),
  brief: text("brief").notNull(),
  source: varchar("source", { length: 120 }),
  status: quoteStatusEnum("status").notNull().default("new"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  notes: text("notes"),
});

// ---------- Media library ----------
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 300 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  alt: varchar("alt", { length: 300 }),
  caption: text("caption"),
  uploadedById: integer("uploaded_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Site settings (single row) ----------
// Brand-level config the admin can edit: studio name, tagline, phone, etc.
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 60 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------- Audit log ----------
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 80 }).notNull(),
  resource: varchar("resource", { length: 80 }),
  resourceId: varchar("resource_id", { length: 80 }),
  meta: jsonb("meta"),
  ip: varchar("ip", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Commerce: Product categories ----------
export const productCategories = pgTable(
  "product_categories",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    image: varchar("image", { length: 500 }),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publishStatusEnum("status").notNull().default("live"),
  },
  (t) => ({ slugIdx: uniqueIndex("product_categories_slug_idx").on(t.slug) })
);

// ---------- Commerce: Products (shop) ----------
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull(),
    sku: varchar("sku", { length: 80 }),
    name: varchar("name", { length: 200 }).notNull(),
    categoryId: integer("category_id").references(() => productCategories.id),
    priceCents: integer("price_cents").notNull(), // stored in cents, e.g. 7800 = $78.00
    compareAtCents: integer("compare_at_cents"),  // original price when on SALE
    badge: varchar("badge", { length: 20 }),       // NEW, BEST, SALE
    description: text("description"),
    shortDescription: text("short_description"),
    images: jsonb("images")
      .$type<Array<{ url: string; alt?: string }>>()
      .notNull()
      .default([]),
    stockQty: integer("stock_qty").notNull().default(100),
    featured: boolean("featured").notNull().default(false),
    status: publishStatusEnum("status").notNull().default("live"),
    // ---- Apparel / variant options (optional) ----
    sizes: jsonb("sizes")
      .$type<string[]>()
      .notNull()
      .default([]), // e.g. ["S","M","L","XL","2XL","3XL"]
    colours: jsonb("colours")
      .$type<Array<{ name: string; hex: string }>>()
      .notNull()
      .default([]), // e.g. [{name:"Hi-vis yellow",hex:"#e5da3a"}]
    fits: jsonb("fits")
      .$type<string[]>()
      .notNull()
      .default([]), // e.g. ["Regular","Slim"]
    specs: jsonb("specs")
      .$type<Array<{ key: string; value: string }>>()
      .notNull()
      .default([]), // [{key:"Fabric",value:"100% polyester"}, ...]
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({ slugIdx: uniqueIndex("products_slug_idx").on(t.slug) })
);

// ---------- Nursery: Plant stock ----------
// Rows here represent what is currently available for purchase.
// The encyclopedia (below) is the reference/care-guide database — separate concern.
export const plants = pgTable(
  "plants",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull(),
    latinName: varchar("latin_name", { length: 200 }).notNull(),
    commonName: varchar("common_name", { length: 200 }),
    family: varchar("family", { length: 100 }),
    priceCents: integer("price_cents").notNull(),
    size: varchar("size", { length: 100 }), // "200mm pot", "45L bag", "tree bag"
    stockQty: integer("stock_qty").notNull().default(0),
    tags: jsonb("tags")
      .$type<string[]>()
      .notNull()
      .default([]), // e.g. ["NATIVE","DROUGHT","FRAGRANT"]
    images: jsonb("images")
      .$type<Array<{ url: string; alt?: string }>>()
      .notNull()
      .default([]),
    shortDescription: text("short_description"),
    description: text("description"),
    care: jsonb("care").$type<PlantCare>(),
    seasons: jsonb("seasons").$type<PlantSeasons>(),
    companions: jsonb("companions")
      .$type<string[]>()
      .notNull()
      .default([]), // slugs of companion plants
    featured: boolean("featured").notNull().default(false),
    status: publishStatusEnum("status").notNull().default("live"),
    encyclopediaSlug: varchar("encyclopedia_slug", { length: 200 }), // link to encyclopedia entry
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({ slugIdx: uniqueIndex("plants_slug_idx").on(t.slug) })
);

// ---------- Encyclopedia: Plant reference database ----------
// Complete botanical reference — care guides, growing conditions, seasonal charts.
// May or may not overlap with nursery stock (linked via encyclopediaSlug on plants).
export const encyclopediaEntries = pgTable(
  "encyclopedia_entries",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull(),
    latinName: varchar("latin_name", { length: 200 }).notNull(),
    commonName: varchar("common_name", { length: 200 }),
    family: varchar("family", { length: 100 }),
    genus: varchar("genus", { length: 100 }),
    description: text("description"),
    climateZones: jsonb("climate_zones")
      .$type<string[]>()
      .notNull()
      .default([]), // e.g. ["temperate","coastal"]
    tags: jsonb("tags")
      .$type<string[]>()
      .notNull()
      .default([]), // NATIVE, DROUGHT, FRAGRANT, etc.
    care: jsonb("care").$type<PlantCare>(),
    seasons: jsonb("seasons").$type<PlantSeasons>(),
    companions: jsonb("companions")
      .$type<string[]>()
      .notNull()
      .default([]), // slugs of companion plants
    images: jsonb("images")
      .$type<Array<{ url: string; alt?: string }>>()
      .notNull()
      .default([]),
    pestNotes: text("pest_notes"),
    propagation: text("propagation"),
    landscapeUse: text("landscape_use"),
    cultivars: jsonb("cultivars")
      .$type<Array<{ name: string; note: string }>>()
      .notNull()
      .default([]), // named varieties + a one-line note
    references: jsonb("references")
      .$type<Array<{ title: string; source: string; url?: string }>>()
      .notNull()
      .default([]), // further-reading citations
    featured: boolean("featured").notNull().default(false),
    status: publishStatusEnum("status").notNull().default("live"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("encyclopedia_entries_slug_idx").on(t.slug),
  })
);

// ---------- Commerce: Orders ----------
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(), // ORD-2024-0001
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 60 }),
  shippingAddress: jsonb("shipping_address").$type<ShippingAddress>(),
  lineItems: jsonb("line_items")
    .$type<OrderLineItem[]>()
    .notNull()
    .default([]),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 200 }),
  stripeSessionId: varchar("stripe_session_id", { length: 200 }),
  status: orderStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------- Section type ----------
// The generic, theme-agnostic shape stored in pages.sections.
export type Section = {
  type: string; // "hero" | "pillars" | "gallery" | "stats" | "cta" | "two_col" | "rich" | ...
  props: Record<string, unknown>;
};

// ---------- Commerce / Nursery shared types ----------
export type PlantCare = {
  water: string;
  light: string;
  soil: string;
  growthRate: string;
  matureSize: string;
};

export type PlantSeasons = {
  flowering?: number[]; // months 1–12
  fruiting?: number[];
};

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

export type OrderLineItem = {
  type: "product" | "plant";
  id: number;
  name: string;
  image?: string;
  priceCents: number;
  quantity: number;
};

// ---------- Relations ----------
export const pagesRelations = relations(pages, ({ many, one }) => ({
  revisions: many(pageRevisions),
  updatedBy: one(users, {
    fields: [pages.updatedById],
    references: [users.id],
  }),
}));

export const pageRevisionsRelations = relations(pageRevisions, ({ one }) => ({
  page: one(pages, {
    fields: [pageRevisions.pageId],
    references: [pages.id],
  }),
  author: one(users, {
    fields: [pageRevisions.authorId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const productCategoriesRelations = relations(
  productCategories,
  ({ many }) => ({ products: many(products) })
);

export const productsRelations = relations(products, ({ one }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
}));
