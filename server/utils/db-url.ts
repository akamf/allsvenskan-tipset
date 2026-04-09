export function assertLocalDatabaseUrl(databaseUrl: string, scriptName: string) {
  const url = new URL(databaseUrl)
  const localHosts = new Set(['127.0.0.1', 'localhost', 'postgres.allsvenskan-tipset.orb.local'])

  if (!localHosts.has(url.hostname)) {
    throw new Error(`${scriptName} refused to run against non-local database host: ${url.hostname}`)
  }

  if (url.hostname.includes('supabase.co')) {
    throw new Error(`${scriptName} refused to run against Supabase host: ${url.hostname}`)
  }
}
