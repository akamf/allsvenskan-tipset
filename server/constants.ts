export const APP_SEASON = 2026
export const LEAGUE_NAME = 'Allsvenskan'
export const COMPETITION_KEY = 'allsvenskan'
export const API_FOOTBALL_LEAGUE_ID = 113

export const CANONICAL_TEAMS = [
  'Hammarby',
  'Djurgården',
  'Mjällby',
  'Malmö FF',
  'IFK Göteborg',
  'AIK',
  'Elfsborg',
  'GAIS',
  'Sirius',
  'Häcken',
  'Västerås',
  'Brommapojkarna',
  'Halmstad',
  'Kalmar FF',
  'Örgryte',
  'Degerfors',
] as const

export type CanonicalTeamName = (typeof CANONICAL_TEAMS)[number]

export const RELEGATION_POSITIONS = [14, 15, 16]
