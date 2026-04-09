export function buildCharts(
  rows: Array<{
    participantName: string
    ranking: number
    totalPoints: number
    roundNumber: number
    capturedAt: Date
  }>,
) {
  const groupedPoints = new Map<number, Record<string, string | number>>()

  for (const row of rows) {
    const point = groupedPoints.get(row.roundNumber) ?? {
      round: row.roundNumber,
      capturedAt: row.capturedAt.toISOString(),
    }

    point[row.participantName] = row.totalPoints
    groupedPoints.set(row.roundNumber, point)
  }

  const groupedRankings = new Map<number, Record<string, string | number>>()

  for (const row of rows) {
    const point = groupedRankings.get(row.roundNumber) ?? {
      round: row.roundNumber,
      capturedAt: row.capturedAt.toISOString(),
    }

    point[row.participantName] = row.ranking
    groupedRankings.set(row.roundNumber, point)
  }

  return {
    points: Array.from(groupedPoints.values()).sort((a, b) => Number(a.round) - Number(b.round)),
    rankings: Array.from(groupedRankings.values()).sort((a, b) => Number(a.round) - Number(b.round)),
  }
}
