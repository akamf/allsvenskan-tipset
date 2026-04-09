import { listPredictionsForSeason } from '../queries/predictions.js'
import { computeLeaderboard, type ComputedParticipantScore } from '../scoring/leaderboard.js'
import { getLiveBundleWithFallback } from './live-data.js'
import type { NormalizedPrediction } from '../types.js'

export async function getParticipantDetailData(participantId: string) {
  const [{ payload }, predictions] = await Promise.all([getLiveBundleWithFallback(), listPredictionsForSeason()])
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
