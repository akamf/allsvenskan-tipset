import type { LiveBundle } from '../api-football/provider.js'
import {
  getLatestStandingsSnapshot,
  getLatestStandingsSnapshotBeforeRound,
  getLatestTopScorerSnapshot,
} from '../queries/snapshots.js'
import { fetchLiveStandingsAndTopScorers } from '../api-football/provider.js'
import { liveStandingRowSchema, normalizedStandingSchema, normalizedTopScorerSchema } from '../types.js'
import { attachPositionMovement } from './standings-form.js'

type LiveStandingRowWithMovement = LiveBundle['liveStandings'][number] & {
  form: string | null
}

type LiveBundleWithMovement = Omit<LiveBundle, 'liveStandings'> & {
  liveStandings: LiveStandingRowWithMovement[]
}

export type LiveBundleResult = {
  status: {
    liveApiAvailable: boolean
    fallbackUsed: boolean
    mode: 'live' | 'fallback'
    latestSyncAt: string | null
    roundNumber: number | null
    source: string
  }
  payload: LiveBundleWithMovement
}

export async function getLiveBundleWithFallback(): Promise<LiveBundleResult> {
  try {
    console.info('[live-data] API-FOOTBALL call started')
    const live = await fetchLiveStandingsAndTopScorers()
    console.info('[live-data] API-FOOTBALL success')
    const previousSnapshot = await getLatestStandingsSnapshotBeforeRound(live.roundNumber).catch((error) => {
      console.warn('[live-data] previous snapshot lookup failed for live data', error)
      return null
    })
    const liveStandings = attachPositionMovement(live.liveStandings, previousSnapshot?.rows ?? null)

    return {
      status: {
        liveApiAvailable: true,
        fallbackUsed: false,
        mode: 'live' as const,
        latestSyncAt: null,
        roundNumber: live.roundNumber,
        source: 'API-FOOTBALL live',
      },
      payload: {
        ...live,
        liveStandings,
      },
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

    const previousSnapshot = await getLatestStandingsSnapshotBeforeRound(standingsSnapshot.snapshot.roundNumber).catch((lookupError) => {
      console.warn('[live-data] previous snapshot lookup failed for fallback data', lookupError)
      return null
    })
    const liveStandings = attachPositionMovement(standingsSnapshot.rows, previousSnapshot?.rows ?? null)

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
        liveStandings: liveStandings.map((row) =>
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
            form: row.form,
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
