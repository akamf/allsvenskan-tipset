import type { VercelRequest, VercelResponse } from '@vercel/node'

export function json(response: VercelResponse, status: number, body: unknown) {
  return response.status(status).json(body)
}

export function assertMethod(request: VercelRequest, response: VercelResponse, methods: string[]) {
  if (!methods.includes(request.method ?? 'GET')) {
    json(response, 405, { error: 'Method not allowed' })
    return false
  }

  return true
}

export function requireCronSecret(request: VercelRequest) {
  const authorization = request.headers.authorization
  const token = authorization?.replace(/^Bearer\s+/i, '')
  return token === process.env.CRON_SECRET
}

export function handleError(response: VercelResponse, error: unknown) {
  console.error(error)
  return json(response, 500, { error: 'Internal server error' })
}
