import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import postgres from 'postgres'
import { requireLocalDatabase } from './local-db-guard.js'

async function initLocalDb() {
  const sqlFile = resolve(process.cwd(), 'drizzle/0000_initial.sql')
  const migration = await readFile(sqlFile, 'utf8')
  const sql = postgres(requireLocalDatabase('init-local-db'), {
    max: 1,
    prepare: false,
  })

  try {
    await sql.unsafe(migration)
    console.info('[init-local-db] schema applied')
  } finally {
    await sql.end({ timeout: 1 })
  }
}

initLocalDb().catch((error) => {
  console.error('[init-local-db] failed', error)
  process.exit(1)
})
