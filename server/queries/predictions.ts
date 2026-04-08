import { staticPredictions } from '../../src/data/predictions'
import { normalizedPredictionSchema, type NormalizedPrediction } from '../types'

export async function getPredictionsForSeason(): Promise<NormalizedPrediction[]> {
  return staticPredictions
    .map((prediction) =>
      normalizedPredictionSchema.parse({
        predictionId: prediction.participantId,
        participantId: prediction.participantId,
        participantName: prediction.participantName,
        predictedTopScorer: prediction.predictedTopScorer,
        rows: prediction.rows,
      }),
    )
    .sort((a, b) => a.participantName.localeCompare(b.participantName))
}
