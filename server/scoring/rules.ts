export function scorePositionDistance(distance: number) {
  if (distance === 0) {
    return 3
  }

  if (distance === 1) {
    return 1
  }

  if (distance <= 4) {
    return 0
  }

  return 0
}

export function beerDebtFromRanking(ranking: number) {
  return Math.max(0, ranking - 1)
}
