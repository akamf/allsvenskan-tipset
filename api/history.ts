import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getEnv } from '../server/env'
import { getHistoryData } from '../server/services/dashboard'
import { assertMethod, handleError, json } from './_utils'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['GET'])) {
    return
  }

  try {
    console.info('[route:/api/history] route entered')
    const env = getEnv()
    console.info('[route:/api/history] env presence', {
      DATABASE_URL: Boolean(env.DATABASE_URL),
      API_FOOTBALL_BASE_URL: Boolean(env.API_FOOTBALL_BASE_URL),
      API_FOOTBALL_KEY: Boolean(env.API_FOOTBALL_KEY),
      ALLSVENSKAN_SEASON: Boolean(env.ALLSVENSKAN_SEASON),
      CRON_SECRET: Boolean(env.CRON_SECRET),
    })
    const data = await getHistoryData()
    console.info('[route:/api/history] final response success')
    return json(response, 200, data)
  } catch (error) {
    console.error('[route:/api/history] final response failure', error)
    return handleError(
      response,
      new Error(`History failed: ${error instanceof Error ? error.message : 'could not read snapshot history from the database'}`),
    )
  }
}
