import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runNightlySync } from '../../server/services/sync.js'
import { assertMethod, handleError, json, requireCronSecret } from '../_utils.js'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['GET'])) {
    return
  }

  if (!requireCronSecret(request)) {
    return json(response, 401, { error: 'Unauthorized' })
  }

  try {
    const result = await runNightlySync()
    return json(response, 200, { ok: true, ...result })
  } catch (error) {
    return handleError(response, error)
  }
}
