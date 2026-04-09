export const canonicalTeams = [
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

export type CanonicalTeamName = (typeof canonicalTeams)[number]
