import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getHistoryData } from '../server/services/dashboard.js'
import { assertMethod, handleError, json } from './_utils.js'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['GET'])) {
    return
  }

  try {
    const data = await getHistoryData()
    return json(response, 200, data)
  } catch (error) {
    return handleError(response, error)
  }
}
