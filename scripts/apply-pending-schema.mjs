// One-off idempotent migration: applies the additive schema from the
// "Release complete" commit (careers + quote-attachment tables + quotes columns)
// that never reached the DB because `db:push --force` fails on re-run
// ("column id is in a primary key" — a drizzle-kit push bug on serial PKs).
// Purely additive + guarded with IF NOT EXISTS, so it is safe to re-run.
// Run once against the target DB:  node scripts/apply-pending-schema.mjs
import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");

const sql = postgres(url, { max: 1, prepare: false });

const DDL = `
DO $$ BEGIN CREATE TYPE job_status AS ENUM ('draft','live','closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE application_status AS ENUM ('new','screening','shortlisted','interview','offer','hired','rejected','withdrawn'); EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS access_token varchar(80);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS services jsonb NOT NULL DEFAULT '[]'::jsonb;
DO $$ BEGIN ALTER TABLE quotes ADD CONSTRAINT quotes_access_token_unique UNIQUE (access_token); EXCEPTION WHEN duplicate_object THEN null; WHEN duplicate_table THEN null; END $$;

CREATE TABLE IF NOT EXISTS quote_attachments (
  id serial PRIMARY KEY,
  quote_id integer NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  stored_path varchar(500) NOT NULL,
  filename varchar(300) NOT NULL,
  mime_type varchar(140) NOT NULL,
  size_bytes integer NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS job_postings (
  id serial PRIMARY KEY,
  slug varchar(200) NOT NULL,
  title varchar(200) NOT NULL,
  team varchar(120) NOT NULL,
  location varchar(160) NOT NULL,
  employment_type varchar(80) NOT NULL,
  summary text NOT NULL,
  description text,
  responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  desirable jsonb NOT NULL DEFAULT '[]'::jsonb,
  salary_range varchar(120),
  closing_date timestamp,
  status job_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS job_postings_slug_idx ON job_postings (slug);

CREATE TABLE IF NOT EXISTS career_applications (
  id serial PRIMARY KEY,
  reference_code varchar(24) NOT NULL UNIQUE,
  access_token varchar(80) NOT NULL UNIQUE,
  job_id integer REFERENCES job_postings(id) ON DELETE SET NULL,
  role_interest varchar(200) NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  email varchar(255) NOT NULL,
  phone varchar(60) NOT NULL,
  suburb varchar(160),
  linkedin_url varchar(500),
  portfolio_url varchar(500),
  cover_letter text NOT NULL,
  years_experience varchar(60),
  availability varchar(120),
  work_rights varchar(120) NOT NULL,
  drivers_licence boolean NOT NULL DEFAULT false,
  resume_path varchar(500) NOT NULL,
  resume_filename varchar(300) NOT NULL,
  resume_mime varchar(120) NOT NULL,
  resume_size integer NOT NULL,
  status application_status NOT NULL DEFAULT 'new',
  rating integer,
  assigned_to_id integer REFERENCES users(id),
  source varchar(120) DEFAULT 'careers-page',
  consent_at timestamp NOT NULL,
  submitted_at timestamp DEFAULT now() NOT NULL,
  reviewed_at timestamp,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS application_notes (
  id serial PRIMARY KEY,
  application_id integer NOT NULL REFERENCES career_applications(id) ON DELETE CASCADE,
  author_id integer REFERENCES users(id),
  body text NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS application_events (
  id serial PRIMARY KEY,
  application_id integer NOT NULL REFERENCES career_applications(id) ON DELETE CASCADE,
  status application_status NOT NULL,
  message text,
  candidate_visible boolean NOT NULL DEFAULT true,
  created_by_id integer REFERENCES users(id),
  created_at timestamp DEFAULT now() NOT NULL
);
`;

try {
  await sql.unsafe(DDL);
  console.log("✓ pending schema applied (careers + quote attachments + quotes columns)");
} catch (e) {
  console.error("✗ failed:", e);
  process.exitCode = 1;
} finally {
  await sql.end();
}
