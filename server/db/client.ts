import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { getDatabaseEnv } from '../env'
import * as schema from './schema'

const globalDb = globalThis as typeof globalThis & {
  __allsvenskanTipsetSql?: postgres.Sql
  __allsvenskanTipsetDb?: ReturnType<typeof drizzle<typeof schema>>
}

export function getSqlClient() {
  if (!globalDb.__allsvenskanTipsetSql) {
    console.info('[db] DB connection started')
    globalDb.__allsvenskanTipsetSql = postgres(getDatabaseEnv().DATABASE_URL, {
      max: 1,
      prepare: false,
    })
  }

  return globalDb.__allsvenskanTipsetSql
}

export function getDb() {
  if (!globalDb.__allsvenskanTipsetDb) {
    globalDb.__allsvenskanTipsetDb = drizzle(getSqlClient(), { schema })
  }

  return globalDb.__allsvenskanTipsetDb
}
