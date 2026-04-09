import { APP_SEASON } from '../constants.js'
import { listPredictionsForSeason } from '../queries/predictions.js'
import { getAllSnapshotHistory, getLatestStandingsSnapshot } from '../queries/snapshots.js'
import { computeLeaderboard } from '../scoring/leaderboard.js'
import { getLiveBundleWithFallback } from './live-data.js'
import { buildCharts } from './chart-series.js'
import { dashboardMetadata } from './dashboard-metadata.js'

export async function getDashboardData() {
  const [{ status, payload }, predictions, historyResult, latestSnapshotResult] = await Promise.all([
    getLiveBundleWithFallback(),
    listPredictionsForSeason(),
    getAllSnapshotHistory().catch(() => ({ standings: [], scorers: [], scoreRows: [] })),
    getLatestStandingsSnapshot().catch(() => null),
  ])

  const leaderboard = computeLeaderboard(predictions, payload.standings, payload.topScorers)
  const charts = buildCharts(historyResult.scoreRows)

  return {
    ...dashboardMetadata,
    status: {
      ...status,
      latestSyncAt: latestSnapshotResult?.snapshot.createdAt.toISOString() ?? status.latestSyncAt,
    },
    summary: {
      leaderName: leaderboard[0]?.participantName ?? null,
      lastPlaceName: leaderboard.at(-1)?.participantName ?? null,
      latestSyncAt: latestSnapshotResult?.snapshot.createdAt.toISOString() ?? status.latestSyncAt,
      currentRound: payload.roundNumber,
    },
    standings: payload.liveStandings,
    topScorers: payload.topScorers.map((row) => ({
      ...row,
      teamName: row.teamName ?? 'Unknown',
    })),
    leaderboard,
    beerDebtTable: leaderboard.map((row) => ({
      participantId: row.participantId,
      participantName: row.participantName,
      beerDebt: row.beerDebt,
      ranking: row.ranking,
    })),
    charts,
    season: APP_SEASON,
  }
}
