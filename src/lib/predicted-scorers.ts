const predictedScorerDisplayNames: Record<string, string> = {
  Abraham: 'Paulos Abraham',
  Besara: 'Nahir Besara',
  Lien: 'Kristian Lien',
  Fenger: 'Max Fenger',
}

export function toPredictedScorerDisplayName(name: string, liveMatchName?: string | null) {
  return predictedScorerDisplayNames[name] ?? liveMatchName ?? name
}
