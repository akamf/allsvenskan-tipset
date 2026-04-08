const mappings: Record<string, string> = {
  'Hammarby FF': 'Hammarby',
  'Djurgardens IF': 'Djurgården',
  'Mjallby AIF': 'Mjällby',
  'Malmo FF': 'Malmö FF',
  'IFK Goteborg': 'IFK Göteborg',
  'AIK Stockholm': 'AIK',
  'IF Elfsborg': 'Elfsborg',
  Gais: 'GAIS',
  'BK Hacken': 'Häcken',
  'Vasteras SK FK': 'Västerås',
  'IF Brommapojkarna': 'Brommapojkarna',
  'Orgryte IS': 'Örgryte',
  'Degerfors IF': 'Degerfors',
}

export function normalizeApiFootballTeamName(teamName: string) {
  const normalized = mappings[teamName]

  if (!normalized) {
    console.warn(`Unknown API-FOOTBALL team name: ${teamName}`)
    return teamName
  }

  return normalized
}
