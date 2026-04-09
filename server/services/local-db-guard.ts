import { getDatabaseEnv } from '../env.js'
import { assertLocalDatabaseUrl } from '../utils/db-url.js'

export function requireLocalDatabase(scriptName: string) {
  const { DATABASE_URL } = getDatabaseEnv()
  assertLocalDatabaseUrl(DATABASE_URL, scriptName)
  return DATABASE_URL
}
