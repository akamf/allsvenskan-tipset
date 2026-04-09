import postgres from 'postgres'
import { getDatabaseEnv } from '../env.js'

const MAX_ATTEMPTS = 30
const WAIT_MS = 1000

async function main() {
  const { APP_ENV, DATABASE_URL } = getDatabaseEnv()

  if (APP_ENV !== 'development') {
    throw new Error(`wait-for-dev-db requires APP_ENV=development, got ${APP_ENV}`)
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const sql = postgres(DATABASE_URL, {
      max: 1,
      prepare: false,
      connect_timeout: 2,
    })

    try {
      await sql`select 1`
      await sql.end({ timeout: 1 })
      console.info(`[wait-for-dev-db] ready after attempt ${attempt}`)
      return
    } catch (error) {
      await sql.end({ timeout: 1 }).catch(() => undefined)

      if (attempt === MAX_ATTEMPTS) {
        throw error
      }

      console.info(`[wait-for-dev-db] waiting for database (${attempt}/${MAX_ATTEMPTS})`)
      await new Promise((resolve) => setTimeout(resolve, WAIT_MS))
    }
  }
}

main().catch((error) => {
  console.error('[wait-for-dev-db] failed', error)
  process.exit(1)
})
