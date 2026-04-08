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

## Environment

```bash
DATABASE_URL=
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
API_FOOTBALL_KEY=
ALLSVENSKAN_SEASON=2026
CRON_SECRET=
```

## Setup

```bash
npm install
cp .env.example .env
psql "$DATABASE_URL" -f drizzle/0000_initial.sql
npm run dev:full
```

## Local Docker Postgres

Use this if you want local snapshot/history data without touching Supabase:

```bash
npm run db:docker:up
npm run db:setup:docker
```

This starts a local Postgres container on `127.0.0.1:54329`, applies [drizzle/0000_initial.sql](/Users/akamf/code/personal/allsvenskan-tipset/drizzle/0000_initial.sql), and seeds local standings/top-scorer/history data into that container only.

Useful commands:

- `npm run db:docker:up`
- `npm run db:setup:docker`
- `npm run db:seed:docker`
- `npm run db:docker:down`

Local commands:

- `npm run dev` starts the Vite frontend only
- `npm run dev:api` starts the Vercel API layer only
- `npm run dev:full` starts both, with Vite proxying `/api` to the local Vercel server

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
2. Discover the Allsvenskan league via API-FOOTBALL.
3. Fetch standings and top scorers.
4. Map and normalize the payload.
5. Start a DB transaction.
6. Insert snapshot headers and rows.
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
npm run dev:full
npm run dev:vite
npm run typecheck
npm run test
npm run build
npm run sync:manual
```
