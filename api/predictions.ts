import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPredictionsData } from '../server/services/dashboard'
import { assertMethod, handleError, json } from './_utils'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['GET'])) {
    return
  }

  try {
    return json(response, 200, await getPredictionsData())
  } catch (error) {
    return handleError(response, error)
  }
}
