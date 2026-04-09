import { findBestPlayerNameMatch } from '../../shared/player-name-match.js'
import { listPredictionsForSeason } from '../queries/predictions.js'
import { getLiveBundleWithFallback } from './live-data.js'
import type { NormalizedPrediction } from '../types.js'

export async function getPredictionsData() {
  const [{ payload }, predictions] = await Promise.all([getLiveBundleWithFallback(), listPredictionsForSeason()])

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
