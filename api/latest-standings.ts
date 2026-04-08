import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getLiveBundleWithFallback } from '../server/services/live-data'
import { assertMethod, handleError, json } from './_utils'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['GET'])) {
    return
  }

  try {
    const result = await getLiveBundleWithFallback()
    return json(response, 200, {
      status: result.status,
      standings: result.payload.liveStandings,
      roundNumber: result.payload.roundNumber,
    })
  } catch (error) {
    return handleError(response, error)
  }
}
