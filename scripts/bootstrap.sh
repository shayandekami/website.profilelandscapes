#!/usr/bin/env bash
# One-shot local setup: env, Postgres (Docker OR Homebrew), schema, seed, dev server.
# Idempotent — safe to re-run.

set -e
cd "$(dirname "$0")/.."

echo "→ Profile Landscapes — local bootstrap"

# 1. Detect Postgres source — prefer Docker if available, else local brew Postgres
PG_PORT=""
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "→ using Docker for Postgres"
  docker compose up -d
  PG_PORT=5433
  for i in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U pl -d pl_web >/dev/null 2>&1; then
      echo "  ready"
      break
    fi
    sleep 1
  done
elif [ -x /opt/homebrew/opt/postgresql@16/bin/pg_isready ] && /opt/homebrew/opt/postgresql@16/bin/pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  echo "→ using local Homebrew Postgres on :5432"
  PG_PORT=5432
else
  echo
  echo "✗ No running Postgres found."
  echo "  Either: install Docker Desktop and re-run, or:"
  echo "    brew install postgresql@16 && brew services start postgresql@16"
  echo "    /opt/homebrew/opt/postgresql@16/bin/createuser -P pl  # password: pl_local_dev"
  echo "    /opt/homebrew/opt/postgresql@16/bin/createdb -O pl pl_web"
  exit 1
fi

# 2. .env.local
if [ ! -f .env.local ]; then
  echo "→ creating .env.local"
  cp .env.example .env.local
  SECRET=$(openssl rand -base64 32 | tr -d '\n')
  sed -i '' "s|AUTH_SECRET=.*|AUTH_SECRET=\"$SECRET\"|" .env.local
fi

# Patch DATABASE_URL to match the discovered Postgres port
sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"postgres://pl:pl_local_dev@localhost:${PG_PORT}/pl_web\"|" .env.local

# 3. node_modules
if [ ! -d node_modules ]; then
  echo "→ installing dependencies (this takes ~30s)"
  npm install --no-audit --no-fund
fi

# 4. Schema + seed
echo "→ applying schema"
npm run db:push --silent

echo "→ seeding content"
npm run db:seed --silent

echo
echo "════════════════════════════════════════════════════"
echo "  Ready. Starting dev server…"
echo
echo "  Public site:  http://localhost:3000"
echo "  Admin:        http://localhost:3000/admin"
echo "  Login:        admin@profilelandscapes.com.au"
echo "                pl-admin-2026"
echo "════════════════════════════════════════════════════"
echo

( sleep 4 && open http://localhost:3000 ) &

exec npm run dev
