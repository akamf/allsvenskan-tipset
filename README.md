# Allsvenskan Tipset

Allsvenskan prediction app built with Vite, React, TypeScript, Tailwind, TanStack Query, Drizzle, Supabase Postgres, Recharts, Lucide, and Vercel serverless functions.

## Final architecture

- Predictions are static in [src/data/predictions.ts](/Users/akamf/code/personal/allsvenskan-tipset/src/data/predictions.ts)
- API-FOOTBALL is the only live source
- Database stores:
  - `standings_snapshots`
  - `standings_snapshot_rows`
  - `top_scorer_snapshots`
  - `top_scorer_snapshot_rows`
  - `participant_scores`
- Cron sync writes new snapshots and participant scores once per day
- Frontend uses live API-backed server endpoints first and falls back to DB snapshots if live fetch fails

## Environment files

```bash
.env.development
.env.production
.env.example
```

Development uses `.env.development` and must point at the local Docker database. Production uses Vercel environment variables with `APP_ENV=production`.
Local `.env` and `.env.local` files are not used and should not exist in the dev workflow.
The dev scripts use `dotenv-cli` override mode, so `.env.development` wins over any shell-level `DATABASE_URL` or `APP_ENV`.

```bash
APP_ENV=development
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/allsvenskan_tipset
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
API_FOOTBALL_KEY=development_placeholder_key
ALLSVENSKAN_SEASON=2026
CRON_SECRET=development_cron_secret
```

## Setup

```bash
npm install
npm run dev
```

`npm run dev` now does all local setup automatically:

1. clears the local Docker volume so dev starts from a known-good state
2. starts local Docker Postgres on `127.0.0.1:5433`
3. waits until the DB accepts connections
4. applies the local Drizzle-generated schema SQL
5. seeds local standings/top-scorer/history data
6. starts the Vercel API layer and Vite frontend

Useful commands:

- `npm run dev`
- `npm run dev:db:up`
- `npm run dev:db:reset`
- `npm run dev:db:down`
- `npm run db:migrate:dev`
- `npm run db:seed:dev`
- `npm run db:setup:docker`

Local commands:

- `npm run dev` starts the full local stack safely
- `npm run dev:api` starts the Vercel API layer with `.env.development` forced over shell env
- `npm run dev:web` starts the Vite frontend manually if needed

## Important files

- [src/data/predictions.ts](/Users/akamf/code/personal/allsvenskan-tipset/src/data/predictions.ts)
- [src/lib/api-football/client.ts](/Users/akamf/code/personal/allsvenskan-tipset/src/lib/api-football/client.ts)
- [src/lib/api-football/map-standings.ts](/Users/akamf/code/personal/allsvenskan-tipset/src/lib/api-football/map-standings.ts)
- [src/lib/api-football/map-topscorers.ts](/Users/akamf/code/personal/allsvenskan-tipset/src/lib/api-football/map-topscorers.ts)
- [server/api-football/provider.ts](/Users/akamf/code/personal/allsvenskan-tipset/server/api-football/provider.ts)
- [server/services/live-data.ts](/Users/akamf/code/personal/allsvenskan-tipset/server/services/live-data.ts)
- [server/services/sync.ts](/Users/akamf/code/personal/allsvenskan-tipset/server/services/sync.ts)
- [api/cron/sync-standings.ts](/Users/akamf/code/personal/allsvenskan-tipset/api/cron/sync-standings.ts)
- [drizzle/0000_initial.sql](/Users/akamf/code/personal/allsvenskan-tipset/drizzle/0000_initial.sql)

## Sync flow

`GET /api/cron/sync-standings`

Flow:

1. Validate `CRON_SECRET` from `?secret=` or bearer token.
2. Fetch standings and top scorers from API-FOOTBALL using the fixed Allsvenskan league id.
3. Map and normalize the payload.
4. Start a DB transaction.
5. Skip writes if the current round already exists.
6. Insert snapshot headers and rows for a new round.
7. Compute participant scores from static predictions.
8. Insert participant score rows.
9. Commit.

## Runtime flow

- Dashboard standings: live first, DB fallback
- Dashboard top scorers: live first, DB fallback
- Leaderboard: computed from current live-or-fallback standings
- History charts: from `participant_scores` snapshots in DB

## Scripts

```bash
npm run dev
npm run dev:api
npm run dev:web
npm run dev:db:up
npm run dev:db:down
npm run db:migrate:dev
npm run db:seed:dev
npm run typecheck
npm run test
npm run build
npm run sync:manual
```
