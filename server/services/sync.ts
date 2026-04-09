import { getDb } from '../db/client.js'
import { getPredictionsForSeason } from '../queries/predictions.js'
import { computeLeaderboard } from '../scoring/leaderboard.js'
import { fetchLiveStandingsAndTopScorers } from '../api-football/provider.js'
import { findExistingRoundSnapshot, insertSnapshotBundle } from './sync-helpers.js'

export async function runNightlySync() {
  const db = getDb()
  const [live, predictions] = await Promise.all([fetchLiveStandingsAndTopScorers(), getPredictionsForSeason()])
  const leaderboard = computeLeaderboard(predictions, live.standings, live.topScorers)

  return db.transaction(async (tx) => {
    const existingStandings = await findExistingRoundSnapshot(tx, live.roundNumber)

    if (existingStandings) {
      return {
        inserted: false,
        roundNumber: live.roundNumber,
        standingsSnapshotId: existingStandings.id,
      }
    }

    const standingsSnapshotId = await insertSnapshotBundle(tx, live, leaderboard)

    return {
      inserted: true,
      roundNumber: live.roundNumber,
      standingsSnapshotId,
    }
  })
}
