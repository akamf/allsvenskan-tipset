import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const transaction = vi.fn()

  return {
    transaction,
    getDb: vi.fn(() => ({ transaction })),
    fetchLiveStandingsAndTopScorers: vi.fn(),
    getPredictionsForSeason: vi.fn(),
    computeLeaderboard: vi.fn(),
    findExistingRoundSnapshot: vi.fn(),
    replaceExistingRoundSnapshotBundle: vi.fn(),
    insertSnapshotBundle: vi.fn(),
  }
})

vi.mock('../server/db/client.js', () => ({
  getDb: mocks.getDb,
}))

vi.mock('../server/api-football/provider.js', () => ({
  fetchLiveStandingsAndTopScorers: mocks.fetchLiveStandingsAndTopScorers,
}))

vi.mock('../server/queries/predictions.js', () => ({
  getPredictionsForSeason: mocks.getPredictionsForSeason,
}))

vi.mock('../server/scoring/leaderboard.js', () => ({
  computeLeaderboard: mocks.computeLeaderboard,
}))

vi.mock('../server/services/sync-helpers.js', () => ({
  findExistingRoundSnapshot: mocks.findExistingRoundSnapshot,
  replaceExistingRoundSnapshotBundle: mocks.replaceExistingRoundSnapshotBundle,
  insertSnapshotBundle: mocks.insertSnapshotBundle,
}))

import { runNightlySync } from '../server/services/sync.js'

afterEach(() => {
  vi.clearAllMocks()
})

describe('runNightlySync', () => {
  it('replaces an existing round bundle and still writes fresh data', async () => {
    const live = {
      leagueName: 'Allsvenskan',
      source: 'api-football',
      capturedAt: '2026-04-13T12:00:00.000Z',
      roundNumber: 2,
      liveStandings: [{ teamName: 'Hammarby', position: 1 }],
      standings: [{ teamName: 'Hammarby', position: 1 }],
      topScorers: [{ rank: 1, playerName: 'Besara', teamName: 'Hammarby', goals: 1 }],
    }
    const predictions = [{ participantId: 'p1', participantName: 'Simon', rows: [], predictedTopScorer: 'Besara' }]
    const leaderboard = [{ participantId: 'p1', participantName: 'Simon', totalPoints: 42, ranking: 1 }]

    mocks.fetchLiveStandingsAndTopScorers.mockResolvedValue(live)
    mocks.getPredictionsForSeason.mockResolvedValue(predictions)
    mocks.computeLeaderboard.mockReturnValue(leaderboard)
    mocks.findExistingRoundSnapshot.mockResolvedValue({ id: 'existing-snapshot' })
    mocks.transaction.mockImplementation(async (callback) => callback({} as never))
    mocks.replaceExistingRoundSnapshotBundle.mockResolvedValue(undefined)
    mocks.insertSnapshotBundle.mockResolvedValue('snapshot-123')

    const result = await runNightlySync()

    expect(mocks.fetchLiveStandingsAndTopScorers).toHaveBeenCalledTimes(1)
    expect(mocks.getPredictionsForSeason).toHaveBeenCalledTimes(1)
    expect(mocks.computeLeaderboard).toHaveBeenCalledWith(predictions, live.standings, live.topScorers)
    expect(mocks.replaceExistingRoundSnapshotBundle).toHaveBeenCalledWith({}, 2)
    expect(mocks.insertSnapshotBundle).toHaveBeenCalledWith({}, live, leaderboard)
    expect(result).toEqual({
      inserted: true,
      replaced: true,
      roundNumber: 2,
      standingsSnapshotId: 'snapshot-123',
    })
  })
})
