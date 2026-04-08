import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { getParticipantDetailData } from '../server/services/dashboard'
import { assertMethod, handleError, json } from './_utils'

const querySchema = z.object({
  id: z.string().min(1),
})

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!assertMethod(request, response, ['GET'])) {
    return
  }

  try {
    const query = querySchema.parse(request.query)
    return json(response, 200, await getParticipantDetailData(query.id))
  } catch (error) {
    return handleError(response, error)
  }
}
