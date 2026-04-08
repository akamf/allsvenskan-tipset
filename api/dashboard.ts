import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDashboardData } from '../server/services/dashboard.js'
import { assertMethod, handleError, json } from './_utils.js'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['GET'])) {
    return
  }

  try {
    console.info('[route:/api/dashboard] route entered')
    console.info('[route:/api/dashboard] env presence', {
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      API_FOOTBALL_BASE_URL: Boolean(process.env.API_FOOTBALL_BASE_URL),
      API_FOOTBALL_KEY: Boolean(process.env.API_FOOTBALL_KEY),
      ALLSVENSKAN_SEASON: Boolean(process.env.ALLSVENSKAN_SEASON),
      CRON_SECRET: Boolean(process.env.CRON_SECRET),
    })
    const data = await getDashboardData()
    console.info('[route:/api/dashboard] final response success')
    return json(response, 200, data)
  } catch (error) {
    console.error('[route:/api/dashboard] final response failure', error)
    return handleError(
      response,
      new Error(
        `Dashboard failed: ${error instanceof Error ? error.message : 'could not fetch live standings and no snapshot fallback was available'}`,
      ),
    )
  }
}
