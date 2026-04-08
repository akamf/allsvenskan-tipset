function normalizePlayerName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getNameTokens(value: string) {
  return normalizePlayerName(value).split(' ').filter(Boolean)
}

export function findBestPlayerNameMatch<T extends { playerName: string }>(
  prediction: string,
  candidates: T[],
) {
  const normalizedPrediction = normalizePlayerName(prediction)

  if (!normalizedPrediction) {
    return null
  }

  const exactMatch = candidates.find(
    (candidate) => normalizePlayerName(candidate.playerName) === normalizedPrediction,
  )

  if (exactMatch) {
    return exactMatch
  }

  const predictionTokens = getNameTokens(prediction)
  const surname = predictionTokens.at(-1)

  if (surname) {
    const surnameMatches = candidates.filter((candidate) => {
      const candidateTokens = getNameTokens(candidate.playerName)
      return candidateTokens.at(-1) === surname
    })

    if (surnameMatches.length === 1) {
      return surnameMatches[0]
    }
  }

  const partialMatches = candidates.filter((candidate) => {
    const candidateName = normalizePlayerName(candidate.playerName)
    return candidateName.includes(normalizedPrediction) || normalizedPrediction.includes(candidateName)
  })

  if (partialMatches.length === 1) {
    return partialMatches[0]
  }

  return null
}

export function getPlayerMatchScore<T extends { rank: number; playerName: string }>(
  prediction: string,
  candidates: T[],
) {
  const matched = findBestPlayerNameMatch(prediction, candidates)

  if (!matched) {
    return {
      matched: null,
      score: -(candidates.length + 1),
    }
  }

  return {
    matched,
    score: matched.rank === 1 ? 0 : -matched.rank,
  }
}
