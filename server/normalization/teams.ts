import { CANONICAL_TEAMS, type CanonicalTeamName } from '../constants.js'
import { normalizeLooseString } from '../utils/text.js'

const aliases: Record<string, CanonicalTeamName> = {
  hammarby: 'Hammarby',
  hammarbyff: 'Hammarby',
  djurgarden: 'Djurgården',
  djurgardensif: 'Djurgården',
  mjallby: 'Mjällby',
  mjallbyaif: 'Mjällby',
  malmoff: 'Malmö FF',
  ifkgoteborg: 'IFK Göteborg',
  ifkgoteborgfk: 'IFK Göteborg',
  ifkgoteborgif: 'IFK Göteborg',
  goteborg: 'IFK Göteborg',
  gais: 'GAIS',
  aikstockholm: 'AIK',
  aik: 'AIK',
  elfsborg: 'Elfsborg',
  ifelfsborg: 'Elfsborg',
  sirius: 'Sirius',
  hacken: 'Häcken',
  bkhacken: 'Häcken',
  vasteras: 'Västerås',
  vasterasskfk: 'Västerås',
  brommapojkarna: 'Brommapojkarna',
  ifbrommapojkarna: 'Brommapojkarna',
  bp: 'Brommapojkarna',
  halmstad: 'Halmstad',
  kalmarff: 'Kalmar FF',
  kalmar: 'Kalmar FF',
  orgryte: 'Örgryte',
  orgryteis: 'Örgryte',
  degerfors: 'Degerfors',
  degerforsif: 'Degerfors',
}

for (const teamName of CANONICAL_TEAMS) {
  aliases[normalizeLooseString(teamName)] = teamName
}

export function normalizeTeamName(input: string): CanonicalTeamName {
  const key = normalizeLooseString(input)
  const team = aliases[key]

  if (!team) {
    throw new Error(`Unrecognized team name from external data: "${input}"`)
  }

  return team
}

export function normalizeTeamNameWithFallback(input: string): string {
  const key = normalizeLooseString(input)
  const team = aliases[key]

  if (!team) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Unrecognized team name from external data: "${input}"`)
    }

    return input
  }

  return team
}
