import type { LiveBundle } from '../api-football/provider'
import { getLatestStandingsSnapshot, getLatestTopScorerSnapshot } from '../queries/snapshots'
import { fetchLiveStandingsAndTopScorers } from '../api-football/provider'
import { liveStandingRowSchema, normalizedStandingSchema, normalizedTopScorerSchema } from '../types'

export type LiveBundleResult = {
  status: {
    liveApiAvailable: boolean
    fallbackUsed: boolean
    mode: 'live' | 'fallback'
    latestSyncAt: string | null
    roundNumber: number | null
    source: string
  }
  payload: LiveBundle
}

export async function getLiveBundleWithFallback(): Promise<LiveBundleResult> {
  try {
    console.info('[live-data] API-FOOTBALL call started')
    const live = await fetchLiveStandingsAndTopScorers()
    console.info('[live-data] API-FOOTBALL success')

    return {
      status: {
        liveApiAvailable: true,
        fallbackUsed: false,
        mode: 'live' as const,
        latestSyncAt: null,
        roundNumber: live.roundNumber,
        source: 'API-FOOTBALL live',
      },
      payload: live,
    }
  } catch (error) {
    console.error('[live-data] API-FOOTBALL failure', error)
    console.info('[live-data] DB fallback started')

    const [standingsSnapshot, scorerSnapshot] = await Promise.all([
      getLatestStandingsSnapshot(),
      getLatestTopScorerSnapshot(),
    ])

    if (!standingsSnapshot) {
      console.error('[live-data] DB fallback failure: no standings snapshot found')
      throw new Error('No standings data available. Sync the database first.')
    }

    console.info('[live-data] DB fallback success')

    return {
      status: {
        liveApiAvailable: false,
        fallbackUsed: true,
        mode: 'fallback' as const,
        latestSyncAt: standingsSnapshot.snapshot.createdAt.toISOString(),
        roundNumber: standingsSnapshot.snapshot.roundNumber,
        source: 'Database snapshot fallback',
      },
      payload: {
        leagueName: standingsSnapshot.snapshot.leagueName,
        source: standingsSnapshot.snapshot.source,
        capturedAt: standingsSnapshot.snapshot.capturedAt.toISOString(),
        roundNumber: standingsSnapshot.snapshot.roundNumber,
        liveStandings: standingsSnapshot.rows.map((row) =>
          liveStandingRowSchema.parse({
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
            updatedAt: standingsSnapshot.snapshot.capturedAt.toISOString(),
          }),
        ),
        standings: standingsSnapshot.rows.map((row) =>
          normalizedStandingSchema.parse({
            teamName: row.teamName,
            position: row.position,
            played: row.played,
            won: row.won,
            drawn: row.drawn,
            lost: row.lost,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            goalDifference: row.goalDifference,
            points: row.points,
          }),
        ),
        topScorers: (scorerSnapshot?.rows ?? []).map((row) =>
          normalizedTopScorerSchema.parse({
            rank: row.rank,
            playerName: row.playerName,
            teamName: row.teamName === 'Unknown' ? null : row.teamName,
            goals: row.goals,
          }),
        ),
      },
    }
  }
}
