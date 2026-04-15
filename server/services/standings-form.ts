type StandingsPositionRow = {
  teamName: string
  position: number
}

type StandingsPositionRowWithForm<T extends StandingsPositionRow = StandingsPositionRow> = T & {
  form: string | null
}

export function formatPositionMovement(previousPosition: number | null | undefined, currentPosition: number) {
  if (previousPosition == null) {
    return null
  }

  const movement = previousPosition - currentPosition

  if (movement === 0) {
    return '-0'
  }

  return movement > 0 ? `+${movement}` : `${movement}`
}

export function attachPositionMovement<T extends StandingsPositionRow>(
  currentRows: T[],
  previousRows: StandingsPositionRow[] | null | undefined,
): Array<StandingsPositionRowWithForm<T>> {
  const previousPositions = new Map(previousRows?.map((row) => [row.teamName, row.position]) ?? [])

  return currentRows.map((row) => ({
    ...row,
    form: formatPositionMovement(previousPositions.get(row.teamName), row.position),
  }))
}
