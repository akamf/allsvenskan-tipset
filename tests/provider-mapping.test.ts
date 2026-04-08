import { describe, expect, it, vi } from 'vitest'
import { mapStandings } from '../src/lib/api-football/map-standings'
import { mapTopScorers } from '../src/lib/api-football/map-topscorers'
import { normalizeApiFootballTeamName } from '../src/lib/api-football/normalize-team-name'

describe('API-FOOTBALL mapping', () => {
  it('maps standings from response[0].league.standings[0]', () => {
    const rows = mapStandings({
      response: [
        {
          league: {
            standings: [
              [
                {
                  rank: 1,
                  team: { id: 1, name: 'Hammarby FF', logo: 'logo-1' },
                  points: 12,
                  goalsDiff: 8,
                  all: {
                    played: 5,
                    win: 4,
                    draw: 0,
                    lose: 1,
                    goals: { for: 10, against: 2 },
                  },
                },
              ],
            ],
          },
        },
      ],
    })

    expect(rows).toEqual([
      {
        teamName: 'Hammarby',
        position: 1,
        played: 5,
        won: 4,
        drawn: 0,
        lost: 1,
        goalsFor: 10,
        goalsAgainst: 2,
        goalDifference: 8,
        points: 12,
      },
    ])
  })

  it('maps top scorers and normalizes team names', () => {
    const rows = mapTopScorers({
      response: [
        {
          player: { name: 'Besara' },
          statistics: [{ team: { name: 'Hammarby FF' }, goals: { total: 5 } }],
        },
      ],
    })

    expect(rows).toEqual([
      {
        rank: 1,
        playerName: 'Besara',
        teamName: 'Hammarby',
        goals: 5,
      },
    ])
  })

  it('warns and falls back to the original team name when unknown', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(normalizeApiFootballTeamName('Unknown FC')).toBe('Unknown FC')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
