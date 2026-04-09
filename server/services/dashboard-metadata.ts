export const dashboardMetadata = {
  folderStructure: [
    'src/app, src/pages, src/components/ui for the Vite React client',
    'server/api-football for live fetches and API-FOOTBALL mapping',
    'server/db for Drizzle schema, client, migrations, and local tooling',
    'server/services and server/queries for fallback, sync, history, and aggregation',
    'api/*.ts Vercel serverless functions for dashboard, leaderboard, history, participants, and cron',
  ],
  schemaSummary: [
    'predictions are static and typed in src/data/predictions.ts',
    'standings_snapshots + standings_snapshot_rows persist round snapshots',
    'top_scorer_snapshots + top_scorer_snapshot_rows persist scorer history',
    'participant_scores stores computed leaderboard history for charts and beer debt',
    'unique season + round indexes prevent duplicate snapshot inserts',
  ],
  apiDesign: [
    'API-FOOTBALL is the only live source and is called server-side only',
    'standings and top scorers are normalized into canonical internal types',
    'runtime reads try live API first and fall back to the latest DB snapshot',
    'frontend consumes Vercel API routes and never sees API secrets',
  ],
  cronFlow: [
    'Vercel cron hits /api/cron/sync-standings with CRON_SECRET protection',
    'the sync fetches live standings and top scorers in one transaction boundary',
    'fresh snapshots are written once per round and participant scores are computed immediately',
    'if API data is malformed or the round already exists, the sync exits safely',
  ],
} as const
