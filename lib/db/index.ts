import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __pl_pg__: ReturnType<typeof postgres> | undefined;
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and start the local DB with `npm run db:up`."
  );
}

// Reuse one connection in dev to avoid exhausting Postgres on hot reload.
const client =
  global.__pl_pg__ ??
  postgres(url, {
    max: 10,
    prepare: false,
  });
if (process.env.NODE_ENV !== "production") global.__pl_pg__ = client;

export const db = drizzle(client, { schema });
export type DB = typeof db;
export * from "./schema";
