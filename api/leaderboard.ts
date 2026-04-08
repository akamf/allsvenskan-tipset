import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDashboardData } from '../server/services/dashboard.js'
import { assertMethod, handleError, json } from './_utils.js'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['GET'])) {
    return
  }

  try {
    const dashboard = await getDashboardData()
    return json(response, 200, {
      status: dashboard.status,
      leaderboard: dashboard.leaderboard,
      beerDebtTable: dashboard.beerDebtTable,
    })
  } catch (error) {
    return handleError(response, error)
  }
}
