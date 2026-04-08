import { RELEGATION_POSITIONS } from '../constants'
import type { NormalizedPrediction, NormalizedStanding, NormalizedTopScorer } from '../types'
import { getPlayerMatchScore } from '../../src/lib/player-name-match'
import { beerDebtFromRanking, scorePositionDistance } from './rules'

type TeamBreakdown = {
  teamName: string
  predictedPosition: number
  actualPosition: number
  distance: number
  points: number
}

export type ComputedParticipantScore = {
  participantId: string
  participantName: string
  predictedTopScorer: string
  livePredictedTopScorerName: string | null
  livePredictedTopScorerGoals: number | null
  livePredictedTopScorerRank: number | null
  totalPoints: number
  ranking: number
  beerDebt: number
  tiebreakScore: number
  exactHits: number
  nearHits: number
  penaltyPoints: number
  championBonus: number
  relegationBonus: number
  teamBreakdown: TeamBreakdown[]
}

function computeTiebreak(predictedTopScorer: string, scorers: NormalizedTopScorer[]) {
  return getPlayerMatchScore(predictedTopScorer, scorers).score
}

export function computeLeaderboard(
  predictions: NormalizedPrediction[],
  standings: NormalizedStanding[],
  scorers: NormalizedTopScorer[],
) {
  const standingsByTeam = new Map(standings.map((row) => [row.teamName, row]))
  const relegatedTeams = new Set(
    standings.filter((row) => RELEGATION_POSITIONS.includes(row.position)).map((row) => row.teamName),
  )

  const computed = predictions.map<ComputedParticipantScore>((prediction) => {
    const teamBreakdown = prediction.rows.map((row) => {
      const actual = standingsByTeam.get(row.teamName)

      if (!actual) {
        throw new Error(`Missing standings data for ${row.teamName}`)
      }

      const distance = Math.abs(row.predictedPosition - actual.position)
      return {
        teamName: row.teamName,
        predictedPosition: row.predictedPosition,
        actualPosition: actual.position,
        distance,
        points: scorePositionDistance(distance),
      }
    })

    const exactHits = teamBreakdown.filter((row) => row.distance === 0).length
    const nearHits = teamBreakdown.filter((row) => row.distance === 1).length
    const penaltyPoints = 0
    const championBonus = teamBreakdown.find((row) => row.predictedPosition === 1 && row.actualPosition === 1) ? 5 : 0
    const relegationBonus = teamBreakdown.filter(
      (row) => RELEGATION_POSITIONS.includes(row.predictedPosition) && relegatedTeams.has(row.teamName),
    ).length * 2
    const topScorerMatch = getPlayerMatchScore(prediction.predictedTopScorer, scorers)
    const livePredictedTopScorer = topScorerMatch.matched
    const tiebreakScore = computeTiebreak(prediction.predictedTopScorer, scorers)
    const totalPoints =
      teamBreakdown.reduce((sum, row) => sum + row.points, 0) + championBonus + relegationBonus

    return {
      participantId: prediction.participantId,
      participantName: prediction.participantName,
      predictedTopScorer: prediction.predictedTopScorer,
      livePredictedTopScorerName: livePredictedTopScorer?.playerName ?? null,
      livePredictedTopScorerGoals: livePredictedTopScorer?.goals ?? null,
      livePredictedTopScorerRank: livePredictedTopScorer?.rank ?? null,
      totalPoints,
      ranking: 0,
      beerDebt: 0,
      tiebreakScore,
      exactHits,
      nearHits,
      penaltyPoints,
      championBonus,
      relegationBonus,
      teamBreakdown,
    }
  })

  const ranked = computed
    .slice()
    .sort((a, b) => b.totalPoints - a.totalPoints || b.tiebreakScore - a.tiebreakScore || a.participantName.localeCompare(b.participantName))
    .map((row, index) => ({
      ...row,
      ranking: index + 1,
      beerDebt: beerDebtFromRanking(index + 1),
    }))

  return ranked
}
