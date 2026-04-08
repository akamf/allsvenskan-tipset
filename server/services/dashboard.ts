import { APP_SEASON } from '../constants.js'
import { getPredictionsForSeason } from '../queries/predictions.js'
import { getAllSnapshotHistory, getLatestStandingsSnapshot } from '../queries/snapshots.js'
import { computeLeaderboard } from '../scoring/leaderboard.js'
import { getLiveBundleWithFallback } from './live-data.js'
import type { NormalizedPrediction } from '../types.js'
import type { ComputedParticipantScore } from '../scoring/leaderboard.js'
import { findBestPlayerNameMatch } from '../../src/lib/player-name-match.js'

const folderStructure = [
  'src/app, src/pages, src/components/ui for the Vite React client',
  'server/api-football for provider verification, live fetches, and mapping',
  'server/db for Drizzle schema, client, migrations, and seed support',
  'server/services and server/queries for fallback, sync, history, and aggregation',
  'api/*.ts Vercel serverless functions for dashboard, leaderboard, history, participants, and cron',
]

const schemaSummary = [
  'participants, predictions, prediction_rows store the five seeded entrants and their 1..16 tables',
  'standings_snapshots + standings_snapshot_rows persist nightly round snapshots',
  'top_scorer_snapshots + top_scorer_snapshot_rows persist nightly scorer history',
  'participant_scores_by_snapshot stores computed leaderboard history for charts and beer debt',
  'unique indexes prevent duplicate round inserts and duplicate prediction rows',
]

const apiDesign = [
  'The provider verifies Allsvenskan through /leagues before using downstream IDs',
  'Season coverage requires standings and player endpoints before the provider proceeds',
  'Standings and top scorers are normalized into canonical internal types with strict team mapping',
  'Unknown external team names fail the sync clearly instead of corrupting data',
  'Runtime reads try live API first and fall back to the latest DB snapshot if necessary',
]

const cronFlow = [
  'Vercel cron hits /api/cron/sync nightly with CRON_SECRET protection',
  'The sync fetches and validates live standings and top scorers in one transaction boundary',
  'Fresh snapshots are written once per round and participant scores are computed immediately',
  'If API data is malformed the transaction rolls back and previous snapshots stay intact',
  'Historical points and rankings remain queryable for dashboard charts and history views',
]

export async function getDashboardData() {
  const [{ status, payload }, predictions, historyResult, latestSnapshotResult] = await Promise.all([
    getLiveBundleWithFallback(),
    getPredictionsForSeason(),
    getAllSnapshotHistory().catch(() => ({ standings: [], scorers: [], scoreRows: [] })),
    getLatestStandingsSnapshot().catch(() => null),
  ])

  const leaderboard = computeLeaderboard(predictions, payload.standings, payload.topScorers)
  const charts = buildCharts(historyResult.scoreRows)

  return {
    folderStructure,
    schemaSummary,
    apiDesign,
    cronFlow,
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

export async function getPredictionsData() {
  const [{ payload }, predictions] = await Promise.all([getLiveBundleWithFallback(), getPredictionsForSeason()])

  return {
    participants: predictions.map((prediction: NormalizedPrediction) => {
      const scorer = findBestPlayerNameMatch(prediction.predictedTopScorer, payload.topScorers)

      return {
        participantId: prediction.participantId,
        participantName: prediction.participantName,
        predictedTopScorer: prediction.predictedTopScorer,
        livePredictedTopScorerName: scorer?.playerName ?? null,
        livePredictedTopScorerGoals: scorer?.goals ?? null,
        predictedRows: prediction.rows,
      }
    }),
  }
}

export async function getHistoryData() {
  console.info('[history] DB history query started')
  const history = await getAllSnapshotHistory()
  console.info('[history] DB history query success')

  return {
    rounds: history.standings.map((snapshot) => snapshot.roundNumber),
    standingsSnapshots: history.standings.map((snapshot) => ({
      snapshotId: snapshot.id,
      roundNumber: snapshot.roundNumber,
      capturedAt: snapshot.capturedAt.toISOString(),
      rows: snapshot.rows.map((row) => ({
        teamId: 0,
        teamName: row.teamName,
        teamLogo: '',
        position: row.position,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        points: row.points,
        form: null,
        status: null,
        description: null,
        updatedAt: snapshot.capturedAt.toISOString(),
      })),
    })),
    topScorerSnapshots: history.scorers.map((snapshot) => ({
      snapshotId: snapshot.id,
      roundNumber: snapshot.roundNumber,
      capturedAt: snapshot.capturedAt.toISOString(),
      rows: snapshot.rows.map((row) => ({
        rank: row.rank,
        playerName: row.playerName,
        teamName: row.teamName,
        goals: row.goals,
      })),
    })),
    charts: buildCharts(history.scoreRows),
  }
}

export async function getParticipantDetailData(participantId: string) {
  const [{ payload }, predictions] = await Promise.all([getLiveBundleWithFallback(), getPredictionsForSeason()])
  const leaderboard = computeLeaderboard(predictions, payload.standings, payload.topScorers)
  const participant = leaderboard.find((row: ComputedParticipantScore) => row.participantId === participantId)
  const prediction = predictions.find((row: NormalizedPrediction) => row.participantId === participantId)

  if (!participant || !prediction) {
    throw new Error('Participant not found')
  }

  return {
    participant: {
      id: participant.participantId,
      name: participant.participantName,
      predictedTopScorer: participant.predictedTopScorer,
      livePredictedTopScorerName: participant.livePredictedTopScorerName,
      livePredictedTopScorerGoals: participant.livePredictedTopScorerGoals,
      livePredictedTopScorerRank: participant.livePredictedTopScorerRank,
    },
    latestScore: participant,
    teamBreakdown: participant.teamBreakdown,
  }
}

function buildCharts(
  rows: Array<{
    participantName: string
    ranking: number
    totalPoints: number
    roundNumber: number
    capturedAt: Date
  }>,
) {
  const grouped = new Map<number, Record<string, string | number>>()

  for (const row of rows) {
    const point =
      grouped.get(row.roundNumber) ??
      {
        round: row.roundNumber,
        capturedAt: row.capturedAt.toISOString(),
      }

    point[row.participantName] = row.totalPoints
    grouped.set(row.roundNumber, point)
  }

  const points = Array.from(grouped.values()).sort((a, b) => Number(a.round) - Number(b.round))
  const groupedRankings = new Map<number, Record<string, string | number>>()

  for (const row of rows) {
    const point =
      groupedRankings.get(row.roundNumber) ??
      {
        round: row.roundNumber,
        capturedAt: row.capturedAt.toISOString(),
      }

    point[row.participantName] = row.ranking
    groupedRankings.set(row.roundNumber, point)
  }

  const rankings = Array.from(groupedRankings.values()).sort((a, b) => Number(a.round) - Number(b.round))

  return { points, rankings }
}
