const displayTeamNames: Record<string, string> = {
  Hammarby: 'Hammarby FF',
  'Djurgården': 'Djurgårdens IF',
  'Mjällby': 'Mjällby AIF',
  'Malmö FF': 'Malmö FF',
  'IFK Göteborg': 'IFK Göteborg',
  AIK: 'AIK',
  Elfsborg: 'IF Elfsborg',
  GAIS: 'GAIS',
  Sirius: 'IK Sirius',
  'Häcken': 'BK Häcken',
  'Västerås': 'Västerås SK',
  'Brommapojkarna': 'IF Brommapojkarna',
  Halmstad: 'Halmstads BK',
  'Kalmar FF': 'Kalmar FF',
  'Örgryte': 'Örgryte IS',
  Degerfors: 'Degerfors IF',
}

export function toDisplayTeamName(teamName: string) {
  return displayTeamNames[teamName] ?? teamName
}
