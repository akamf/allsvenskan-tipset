import { z } from 'zod'
import {
  dashboardResponseSchema,
  historyResponseSchema,
  participantDetailResponseSchema,
} from './types'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(input: string, schema: z.ZodSchema<T>) {
  const response = await fetch(input)
  const json: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const parsed = z.object({ error: z.string() }).safeParse(json)
    throw new ApiError(parsed.success ? parsed.data.error : `Request failed: ${response.status}`, response.status)
  }

  const parsed = schema.safeParse(json)

  if (!parsed.success) {
    throw new ApiError(`Response parsing failed for ${input}`, response.status)
  }

  return parsed.data
}

export const api = {
  dashboard: () => request('/api/dashboard', dashboardResponseSchema),
  history: () => request('/api/history', historyResponseSchema),
  participant: (participantId: string) =>
    request(`/api/participant?id=${encodeURIComponent(participantId)}`, participantDetailResponseSchema),
}
