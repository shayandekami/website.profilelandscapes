# Profile Landscapes — Web App

Dynamic Next.js + Postgres rebuild of the static prototype in the parent
folder. Includes a custom admin CMS and a template-agnostic content layer.

The static HTML prototype lives in `../` (one level up) and is preserved as a
visual reference — this `web/` folder is the new source of truth.

---

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript + React 19
- **Database:** PostgreSQL 16 (via Docker locally)
- **ORM:** Drizzle
- **Auth:** Auth.js v5 (next-auth beta), JWT sessions, email + password
- **Validation:** Zod
- **Theme system:** swappable themes in `/themes/<name>/`

---

## Local setup (first time)

You need Node ≥ 20, npm, and Docker Desktop installed on your Mac.

```bash
cd web

# 1. install dependencies
npm install

# 2. create your local env file
cp .env.example .env.local
#   then open .env.local and replace AUTH_SECRET with the output of:
#   openssl rand -base64 32

# 3. start the local Postgres container
npm run db:up

# 4. push the schema to the DB
npm run db:push

# 5. seed initial content (pages, projects, admin user)
npm run db:seed

# 6. run the dev server
npm run dev
```

The site is then at <http://localhost:3000> and the admin at
<http://localhost:3000/admin>.

**Seeded admin login:**
- Email: `admin@profilelandscapes.com.au`
- Password: `pl-admin-2026`

Change this immediately by editing the user in the DB (`npm run db:studio`)
or via the Settings page once Phase 2 lands.

---

## Day-to-day commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server on :3000 |
| `npm run build` | Production build |
| `npm run db:up` | Bring up local Postgres in Docker |
| `npm run db:down` | Stop the local Postgres container |
| `npm run db:push` | Apply schema changes to the local DB |
| `npm run db:studio` | Open Drizzle Studio — a web UI for the DB |
| `npm run db:seed` | Re-run the seed (idempotent) |
| `npm run db:reset` | DROP everything and re-seed (LOCAL ONLY) |

---

## How the CMS works

Pages are stored in the DB as ordered lists of **sections**, each with a
`type` and a JSON `props` blob. The active theme decides how each type
renders.

```
DB:                         Theme:
pages.sections = [          themes/profile-landscapes/sections/
  { type: "hero",  props },     ├─ Hero.tsx       ← renders `hero`
  { type: "pillars", props },   ├─ Pillars.tsx    ← renders `pillars`
  ...                            └─ ...
]
```

A second company's theme is just a new folder under `themes/` exporting
the same `Theme` contract (`themes/types.ts`). Set `THEME=<name>` in
`.env.local` and that company's components render the same data.

### Sections supported by the current theme

`hero`, `pillars`, `stats`, `cta`, `page_head`, `two_col`, `contact_form`,
`project_grid`, `gallery`, `rich`. Add more in `themes/profile-landscapes/sections/`
plus a schema entry in `components/admin/section-schemas.ts` so the editor
knows how to edit them.

---

## File layout

```
web/
├── app/
│   ├── (public)/               public site — uses the active theme
│   │   ├── layout.tsx          renders Header + Footer from the theme
│   │   ├── page.tsx            home — loads page "/" from DB
│   │   ├── [slug]/page.tsx     all other CMS pages (/about, /services, …)
│   │   ├── projects/[slug]/    project detail
│   │   └── not-found.tsx
│   ├── admin/                  admin CMS — JWT-protected
│   │   ├── layout.tsx          loads admin stylesheets only
│   │   ├── login/page.tsx      sign-in page (no chrome)
│   │   └── (chrome)/           pages wrapped with sidebar + topnav
│   │       ├── layout.tsx      enforces auth
│   │       ├── page.tsx        dashboard
│   │       ├── pages/          CMS page editor
│   │       ├── quotes/         quote inbox
│   │       └── portfolio/      project portfolio (read-only Phase 1)
│   └── api/
│       ├── quote/route.ts      public contact form endpoint
│       ├── auth/[...nextauth]/ Auth.js handlers
│       └── admin/signout/      POST → end session
├── components/
│   └── admin/
│       ├── Sidebar.tsx, TopNav.tsx
│       ├── PageEditor.tsx      the field-driven section editor
│       └── section-schemas.ts  what fields each section type exposes
├── lib/
│   ├── db/
│   │   ├── schema.ts           Drizzle schema (pages, projects, quotes, …)
│   │   ├── index.ts            DB client
│   │   ├── seed.ts             initial content
│   │   └── reset.ts            destructive reset for local dev
│   ├── content.ts              read-side API used by public pages
│   ├── auth.ts                 Auth.js config
│   └── rate-limit.ts           in-memory rate limiter
├── themes/
│   ├── types.ts                Theme contract
│   ├── active.ts               resolves env THEME → theme object
│   └── profile-landscapes/
│       ├── index.ts            exports the Theme
│       ├── Header.tsx          site nav
│       ├── Footer.tsx          site footer
│       └── sections/           one component per section type
├── public/
│   ├── assets/                 production photography
│   ├── themes/profile-landscapes/site.css      (copied from prototype)
│   ├── themes/profile-landscapes/site-ext.css  (additive)
│   ├── admin/admin.css                          (copied from prototype)
│   └── admin/admin-ext.css                      (additive)
├── drizzle.config.ts
├── docker-compose.yml
└── README.md
```

---

## Security baseline

What's wired up today:

- Bcrypt password hashing
- JWT sessions, httpOnly cookies
- Middleware-gated admin routes
- Server-side auth check on every admin page (defense in depth)
- Zod validation on every public endpoint
- Honeypot + rate limit on the quote form
- Revision history on page edits
- Audit log on admin writes

What still needs doing (Phase 2):
- 2FA for admin accounts
- CSP headers
- DOMPurify on rich-text saves
- Resend email integration for quote notifications
- Real media upload (currently URL-only)
- Backup verification

---

## Deploying to production

The intended target is **Vercel + Neon Postgres + Cloudflare R2** (~A$110/mo).
When ready:

1. Create a Neon project, copy the AU connection string.
2. Push this repo to GitHub.
3. Import to Vercel; set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`,
   `THEME` as env vars.
4. Vercel builds the same `next build`.
5. Run `npm run db:push` against the Neon URL to apply schema.
6. Run `npm run db:seed` once to set up initial content.

No code changes are required between local and production — only the env
vars differ.

---

## OneDrive note

This folder lives in OneDrive. To avoid sync slowdowns from `node_modules`:
- Right-click the `node_modules` folder in Finder once it exists →
  **Free up space** (so OneDrive doesn't try to keep it locally).
- Or move the repo to `~/Code/PL-Web/` and keep just the design assets in
  OneDrive — recommended if you'll be running the dev server often.
