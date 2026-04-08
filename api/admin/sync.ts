import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runNightlySync } from '../../server/services/sync'
import { assertMethod, handleError, json, requireCronSecret } from '../_utils'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['POST'])) {
    return
  }

  if (!requireCronSecret(request)) {
    return json(response, 401, { error: 'Unauthorized' })
  }

  try {
    return json(response, 200, await runNightlySync())
  } catch (error) {
    return handleError(response, error)
  }
}
