import { getDb } from '../db/client.js'
import { getPredictionsForSeason } from '../queries/predictions.js'
import { computeLeaderboard } from '../scoring/leaderboard.js'
import { fetchLiveStandingsAndTopScorers } from '../api-football/provider.js'
import { findExistingRoundSnapshot, insertSnapshotBundle, replaceExistingRoundSnapshotBundle } from './sync-helpers.js'

export async function runNightlySync() {
  const db = getDb()
  const [live, predictions] = await Promise.all([fetchLiveStandingsAndTopScorers(), getPredictionsForSeason()])
  const leaderboard = computeLeaderboard(predictions, live.standings, live.topScorers)

  return db.transaction(async (tx) => {
    const existingStandings = await findExistingRoundSnapshot(tx, live.roundNumber)

    await replaceExistingRoundSnapshotBundle(tx, live.roundNumber)

    const standingsSnapshotId = await insertSnapshotBundle(tx, live, leaderboard)

    return {
      inserted: true,
      replaced: Boolean(existingStandings),
      roundNumber: live.roundNumber,
      standingsSnapshotId,
    }
  })
}
