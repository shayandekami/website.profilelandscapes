import type { ComponentType } from "react";
import type {
  products,
  productCategories,
  plants,
  encyclopediaEntries,
  orders,
  quotes,
} from "@/lib/db/schema";

/**
 * THE THEME CONTRACT
 * ------------------
 * Every theme is a folder under /themes/<name>/ that exports a `Theme` object.
 * The renderer (app/(public)/[...slug]/page.tsx) imports the active theme via
 *   import { theme } from "@/themes/active"
 * which resolves to the folder named by env THEME.
 *
 * Adding a second theme for a different company:
 *   1. Copy /themes/profile-landscapes to /themes/<new-name>
 *   2. Replace components and styles
 *   3. Make sure every section type used by the DB has a renderer
 *   4. Set THEME=<new-name> in .env.local
 *   5. Run npm run dev — nothing else changes
 */

// ---------- Inferred DB row types (used as component props) ----------
export type ShopProduct = typeof products.$inferSelect & {
  category?: typeof productCategories.$inferSelect | null;
};
export type ShopCategory = typeof productCategories.$inferSelect;
export type NurseryPlant = typeof plants.$inferSelect;
export type EncyclopediaEntry = typeof encyclopediaEntries.$inferSelect;
export type OrderRecord = typeof orders.$inferSelect;
export type QuoteRecord = typeof quotes.$inferSelect;

// ---------- Core types ----------
export type SectionComponent = ComponentType<{
  props: Record<string, unknown>;
  // Pages render server-side, so sections can be async server components.
}>;

export type ThemeChrome = {
  Header: ComponentType<{ studioName: string; nav: NavGroup[] }>;
  Footer: ComponentType<{
    studioName: string;
    phone: string;
    email: string;
    address: string;
    nav?: NavGroup[];
    legal: { acn: string; abn: string; licence: string; founded: number };
  }>;
};

export type NavGroup = {
  key: string;
  label: string;
  href: string;
  matches?: string[];
  tagline?: string;
  children?: { href: string; label: string; description: string }[];
};

/**
 * Optional commerce/nursery/encyclopedia component overrides.
 * If a theme does not provide these, the core uses its own default layouts
 * from components/commerce/defaults/.
 */
export type ThemeCommerce = {
  /** Full shop listing page (PLP) */
  ShopPage?: ComponentType<{
    products: ShopProduct[];
    categories: ShopCategory[];
    selectedCategory?: string;
    searchQuery?: string;
  }>;
  /** Single product detail page (PDP) */
  ProductPage?: ComponentType<{
    product: ShopProduct;
    related: ShopProduct[];
  }>;
  /** Cart page — client component, reads from localStorage */
  CartPage?: ComponentType;
};

export type ThemeNursery = {
  /** Nursery plant listing with finder tool */
  NurseryPage?: ComponentType<{
    plants: NurseryPlant[];
    selectedTag?: string;
    searchQuery?: string;
  }>;
  /** Single plant detail page */
  PlantPage?: ComponentType<{
    plant: NurseryPlant;
    companions: NurseryPlant[];
  }>;
};

export type ThemeEncyclopedia = {
  /** Encyclopedia listing page */
  IndexPage?: ComponentType<{
    entries: EncyclopediaEntry[];
    selectedTag?: string;
    searchQuery?: string;
  }>;
  /** Single encyclopedia entry page */
  EntryPage?: ComponentType<{
    entry: EncyclopediaEntry;
    companions: EncyclopediaEntry[];
  }>;
};

export type ThemeQuoteTracker = {
  /** Public quote status page */
  QuoteStatusPage?: ComponentType<{
    quote: Pick<QuoteRecord, "referenceCode" | "status" | "name" | "receivedAt" | "sector" | "budget"> | null;
    ref: string;
  }>;
};

export type Theme = {
  /** Human label, shown in the admin theme picker */
  name: string;
  /** Path to the theme's global stylesheet, relative to /web */
  stylesheet: string;
  /** A component for each section `type` the DB might contain */
  sections: Record<string, SectionComponent>;
  /** Site chrome: header + footer */
  chrome: ThemeChrome;
  /** Default nav structure for this theme */
  nav: NavGroup[];
  /** Optional CSS variable overrides applied at :root for this theme */
  tokens?: Record<string, string>;
  /** Optional shop/commerce component overrides */
  commerce?: ThemeCommerce;
  /** Optional nursery retail component overrides */
  nursery?: ThemeNursery;
  /** Optional plant encyclopedia component overrides */
  encyclopedia?: ThemeEncyclopedia;
  /** Optional quote tracker component override */
  quoteTracker?: ThemeQuoteTracker;
};
