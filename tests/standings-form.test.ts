import { describe, expect, it } from 'vitest'
import { attachPositionMovement, formatPositionMovement } from '../server/services/standings-form.js'

describe('standings form helpers', () => {
  it('formats position movement with signed deltas and -0 for unchanged positions', () => {
    expect(formatPositionMovement(5, 3)).toBe('+2')
    expect(formatPositionMovement(3, 5)).toBe('-2')
    expect(formatPositionMovement(4, 4)).toBe('-0')
    expect(formatPositionMovement(null, 4)).toBeNull()
  })

  it('attaches movement strings to each row using the previous snapshot', () => {
    expect(
      attachPositionMovement(
        [
          { teamName: 'Hammarby', position: 1 },
          { teamName: 'Djurgården', position: 3 },
          { teamName: 'Malmö FF', position: 4 },
          { teamName: 'AIK', position: 6 },
        ],
        [
          { teamName: 'Hammarby', position: 3 },
          { teamName: 'Djurgården', position: 2 },
          { teamName: 'Malmö FF', position: 4 },
        ],
      ),
    ).toEqual([
      { teamName: 'Hammarby', position: 1, form: '+2' },
      { teamName: 'Djurgården', position: 3, form: '-1' },
      { teamName: 'Malmö FF', position: 4, form: '-0' },
      { teamName: 'AIK', position: 6, form: null },
    ])
  })
})
