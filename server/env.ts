import { z } from 'zod'
import { APP_SEASON } from './constants'

loadLocalEnv()

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
})

const apiFootballEnvSchema = z.object({
  API_FOOTBALL_BASE_URL: z.string().url(),
  API_FOOTBALL_KEY: z.string().min(1),
  ALLSVENSKAN_SEASON: z.coerce.number().default(APP_SEASON),
})

const cronEnvSchema = z.object({
  CRON_SECRET: z.string().min(1),
})

const envSchema = z.object({
  ...databaseEnvSchema.shape,
  ...apiFootballEnvSchema.shape,
  ...cronEnvSchema.shape,
})

let cachedDatabaseEnv: z.infer<typeof databaseEnvSchema> | null = null
let cachedApiFootballEnv: z.infer<typeof apiFootballEnvSchema> | null = null
let cachedCronEnv: z.infer<typeof cronEnvSchema> | null = null
let cachedEnv: z.infer<typeof envSchema> | null = null

export function getDatabaseEnv() {
  cachedDatabaseEnv ??= databaseEnvSchema.parse(process.env)
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
  cachedEnv ??= envSchema.parse(process.env)
  return cachedEnv
}

function loadLocalEnv() {
  if (typeof process.loadEnvFile !== 'function') {
    return
  }

  process.loadEnvFile()
}
