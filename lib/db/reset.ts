import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import postgres from "postgres";

/**
 * DESTRUCTIVE — drops the public schema. Used by `npm run db:reset`.
 * Safe in local dev, never wire this to production.
 */
async function main() {
  const url = process.env.DATABASE_URL!;
  const sql = postgres(url, { max: 1 });
  await sql.unsafe(`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`);
  await sql.end();
  console.log("✓ schema reset");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
