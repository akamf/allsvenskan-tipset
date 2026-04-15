import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  fetchLiveStandingsAndTopScorers: vi.fn(),
  getLatestStandingsSnapshot: vi.fn(),
  getLatestStandingsSnapshotBeforeRound: vi.fn(),
  getLatestTopScorerSnapshot: vi.fn(),
}))

vi.mock('../server/api-football/provider.js', () => ({
  fetchLiveStandingsAndTopScorers: mocks.fetchLiveStandingsAndTopScorers,
}))

vi.mock('../server/queries/snapshots.js', () => ({
  getLatestStandingsSnapshot: mocks.getLatestStandingsSnapshot,
  getLatestStandingsSnapshotBeforeRound: mocks.getLatestStandingsSnapshotBeforeRound,
  getLatestTopScorerSnapshot: mocks.getLatestTopScorerSnapshot,
}))

import { getLiveBundleWithFallback } from '../server/services/live-data.js'

afterEach(() => {
  vi.clearAllMocks()
})

describe('getLiveBundleWithFallback', () => {
  it('adds position movement to live standings from the previous snapshot', async () => {
    mocks.fetchLiveStandingsAndTopScorers.mockResolvedValue({
      leagueName: 'Allsvenskan',
      source: 'api-football',
      capturedAt: '2026-04-15T12:00:00.000Z',
      roundNumber: 4,
      liveStandings: [
        { teamName: 'Hammarby', position: 1 },
        { teamName: 'Djurgården', position: 4 },
        { teamName: 'Malmö FF', position: 4 },
      ],
      standings: [],
      topScorers: [],
    })
    mocks.getLatestStandingsSnapshotBeforeRound.mockResolvedValue({
      snapshot: { roundNumber: 3 },
      rows: [
        { teamName: 'Hammarby', position: 3 },
        { teamName: 'Djurgården', position: 2 },
        { teamName: 'Malmö FF', position: 4 },
      ],
    })

    const result = await getLiveBundleWithFallback()

    expect(mocks.getLatestStandingsSnapshotBeforeRound).toHaveBeenCalledWith(4)
    expect(result.payload.liveStandings).toEqual([
      { teamName: 'Hammarby', position: 1, form: '+2' },
      { teamName: 'Djurgården', position: 4, form: '-2' },
      { teamName: 'Malmö FF', position: 4, form: '-0' },
    ])
  })

  it('adds position movement in the fallback path as well', async () => {
    mocks.fetchLiveStandingsAndTopScorers.mockRejectedValue(new Error('offline'))
    mocks.getLatestStandingsSnapshot.mockResolvedValue({
      snapshot: {
        leagueName: 'Allsvenskan',
        source: 'seed',
        capturedAt: new Date('2026-04-15T12:00:00.000Z'),
        createdAt: new Date('2026-04-15T12:05:00.000Z'),
        roundNumber: 4,
      },
      rows: [
        { teamName: 'Hammarby', position: 1, played: 4, won: 3, drawn: 1, lost: 0, goalsFor: 8, goalsAgainst: 2, goalDifference: 6, points: 10 },
        { teamName: 'Djurgården', position: 4, played: 4, won: 2, drawn: 1, lost: 1, goalsFor: 6, goalsAgainst: 4, goalDifference: 2, points: 7 },
      ],
    })
    mocks.getLatestStandingsSnapshotBeforeRound.mockResolvedValue({
      snapshot: { roundNumber: 3 },
      rows: [
        { teamName: 'Hammarby', position: 2 },
        { teamName: 'Djurgården', position: 4 },
      ],
    })
    mocks.getLatestTopScorerSnapshot.mockResolvedValue(null)

    const result = await getLiveBundleWithFallback()

    expect(result.status.mode).toBe('fallback')
    expect(result.payload.liveStandings).toEqual([
      expect.objectContaining({ teamName: 'Hammarby', position: 1, form: '+1' }),
      expect.objectContaining({ teamName: 'Djurgården', position: 4, form: '-0' }),
    ])
  })
})
