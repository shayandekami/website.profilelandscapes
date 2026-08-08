/**
 * Additive, idempotent migration — nursery price-source columns.
 *
 *   npx tsx lib/db/migrate-nursery-source.ts      (or: npm run db:migrate:nursery)
 *
 * Adds the columns that let a website plant be priced from a real supplier cost
 * (Andreasens / Alpine / Downes via the webapp price DB, or Evergreen) × a markup,
 * instead of a hand-typed price.
 *
 * Safe by design:
 *   • ADD COLUMN IF NOT EXISTS only — never drops or alters existing data.
 *   • Re-runnable: running it twice is a no-op.
 *   • Existing plants default to price_source='manual', so current behaviour and
 *     all current prices are unchanged until someone opts a plant into a source.
 *
 * Use this instead of `drizzle-kit push --force` against production, which can
 * drop/alter objects if the schema has drifted.
 */
import { sql } from "drizzle-orm";
import { db } from "./index";

const STATEMENTS = [
  `ALTER TABLE plants ADD COLUMN IF NOT EXISTS price_source varchar(20) NOT NULL DEFAULT 'manual'`,
  `ALTER TABLE plants ADD COLUMN IF NOT EXISTS source_supplier varchar(60)`,
  `ALTER TABLE plants ADD COLUMN IF NOT EXISTS source_ref varchar(250)`,
  `ALTER TABLE plants ADD COLUMN IF NOT EXISTS cost_cents integer`,
  `ALTER TABLE plants ADD COLUMN IF NOT EXISTS markup_pct integer NOT NULL DEFAULT 50`,
  `ALTER TABLE plants ADD COLUMN IF NOT EXISTS price_synced_at timestamp`,
];

async function main() {
  console.log("→ nursery price-source migration…");
  for (const stmt of STATEMENTS) {
    await db.execute(sql.raw(stmt));
    console.log("  ✓", stmt.replace(/ADD COLUMN IF NOT EXISTS /, "+ ").slice(0, 90));
  }
  console.log("✓ done — existing plants remain price_source='manual' (unchanged).");
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ migration failed:", err);
  process.exit(1);
});
