import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDashboardData } from '../server/services/dashboard.js'
import { assertMethod, handleError, json } from './_utils.js'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['GET'])) {
    return
  }

  try {
    const dashboard = await getDashboardData()
    return json(response, 200, dashboard.status)
  } catch (error) {
    return handleError(response, error)
  }
}
