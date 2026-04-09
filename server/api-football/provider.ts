import { API_FOOTBALL_LEAGUE_ID } from '../constants.js'
import { normalizeTeamName } from '../normalization/teams.js'
import type { NormalizedStanding, NormalizedTopScorer } from '../types.js'
import { getEnv } from '../env.js'
import { apiFootballGet } from './client.js'
import { mapStandings } from './map-standings.js'
import { mapTopScorers } from './map-topscorers.js'

export async function fetchLiveStandingsAndTopScorers() {
  const env = getEnv()
  console.info('[api-football] API-FOOTBALL call started: /standings and /players/topscorers')
  const [standingsPayload, scorersPayload] = await Promise.all([
    apiFootballGet('/standings', { league: API_FOOTBALL_LEAGUE_ID, season: env.ALLSVENSKAN_SEASON }),
    apiFootballGet('/players/topscorers', { league: API_FOOTBALL_LEAGUE_ID, season: env.ALLSVENSKAN_SEASON }),
  ])
  console.info('[api-football] API-FOOTBALL success: /standings and /players/topscorers')

  const liveStandings = mapStandings(standingsPayload).sort((a, b) => a.position - b.position)
  const standings: NormalizedStanding[] = liveStandings.flatMap((row) => {
    const teamName = (() => {
      try {
        return normalizeTeamName(row.teamName)
      } catch {
        return null
      }
    })()

    return teamName ? [{
      teamName,
      position: row.position,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
    }] : []
  })

  const topScorers: NormalizedTopScorer[] = mapTopScorers(scorersPayload).map((row) => ({
    rank: row.rank,
    playerName: row.playerName,
    teamName: (() => {
      try {
        return normalizeTeamName(row.teamName)
      } catch {
        return null
      }
    })(),
    goals: row.goals,
  }))

  return {
    leagueName: 'Allsvenskan',
    source: 'api-football',
    capturedAt: new Date().toISOString(),
    roundNumber: Math.max(...liveStandings.map((row) => row.played)),
    liveStandings,
    standings,
    topScorers,
  }
}

export type LiveBundle = Awaited<ReturnType<typeof fetchLiveStandingsAndTopScorers>>
