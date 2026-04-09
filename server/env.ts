import { z } from 'zod'
import { APP_SEASON } from './constants.js'
import { assertLocalDatabaseUrl } from './utils/db-url.js'

const appEnvSchema = z.object({
  APP_ENV: z.enum(['development', 'production']).default('production'),
})

const databaseEnvSchema = appEnvSchema.extend({
  DATABASE_URL: z.string().min(1),
})

const apiFootballEnvSchema = appEnvSchema.extend({
  API_FOOTBALL_BASE_URL: z.string().url(),
  API_FOOTBALL_KEY: z.string().min(1),
  ALLSVENSKAN_SEASON: z.coerce.number().default(APP_SEASON),
})

const cronEnvSchema = appEnvSchema.extend({
  CRON_SECRET: z.string().min(1),
})

const envSchema = appEnvSchema.extend({
  DATABASE_URL: z.string().min(1),
  API_FOOTBALL_BASE_URL: z.string().url(),
  API_FOOTBALL_KEY: z.string().min(1),
  ALLSVENSKAN_SEASON: z.coerce.number().default(APP_SEASON),
  CRON_SECRET: z.string().min(1),
})

let cachedDatabaseEnv: z.infer<typeof databaseEnvSchema> | null = null
let cachedApiFootballEnv: z.infer<typeof apiFootballEnvSchema> | null = null
let cachedCronEnv: z.infer<typeof cronEnvSchema> | null = null
let cachedEnv: z.infer<typeof envSchema> | null = null

export function getDatabaseEnv() {
  cachedDatabaseEnv ??= validateDatabaseEnv(databaseEnvSchema.parse(process.env))
  return cachedDatabaseEnv
}

export function getApiFootballEnv() {
  cachedApiFootballEnv ??= apiFootballEnvSchema.parse(process.env)
  return cachedApiFootballEnv
}

export function getCronEnv() {
  cachedCronEnv ??= cronEnvSchema.parse(process.env)
  return cachedCronEnv
}

export function getEnv() {
  cachedEnv ??= validateDatabaseEnv(envSchema.parse(process.env))
  return cachedEnv
}

function validateDatabaseEnv<T extends { APP_ENV: 'development' | 'production'; DATABASE_URL: string }>(env: T) {
  if (env.APP_ENV === 'development') {
    if (env.DATABASE_URL.includes('supabase.co')) {
      throw new Error('Development DATABASE_URL must never point to Supabase')
    }

    assertLocalDatabaseUrl(env.DATABASE_URL, 'development environment')
  }

  return env
}
