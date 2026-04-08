import { getEnv } from '../../../server/env.js'

export async function apiFootballGet(path: string, params: Record<string, string | number>) {
  const env = getEnv()
  const url = new URL(path, env.API_FOOTBALL_BASE_URL)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value))
  }

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': env.API_FOOTBALL_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`API-FOOTBALL request failed with ${response.status}`)
  }

  return response.json()
}
