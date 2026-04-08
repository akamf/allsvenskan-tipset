import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runNightlySync } from '../../server/services/sync.js'
import { handleError, json } from '../_utils.js'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    return json(response, 405, { error: 'Method not allowed' })
  }

  const secret = typeof request.query.secret === 'string' ? request.query.secret : null
  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, '') ?? null

  if (secret !== process.env.CRON_SECRET && bearer !== process.env.CRON_SECRET) {
    return json(response, 401, { error: 'Unauthorized' })
  }

  try {
    const result = await runNightlySync()
    return json(response, 200, { ok: true, ...result })
  } catch (error) {
    return handleError(response, error)
  }
}
