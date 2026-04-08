import { and, eq } from 'drizzle-orm'
import { APP_SEASON, LEAGUE_NAME } from '../constants.js'
import { getDb } from '../db/client.js'
import {
  participantScores,
  standingsSnapshotRows,
  standingsSnapshots,
  topScorerSnapshotRows,
  topScorerSnapshots,
} from '../db/schema.js'
import { getPredictionsForSeason } from '../queries/predictions.js'
import { computeLeaderboard } from '../scoring/leaderboard.js'
import { fetchLiveStandingsAndTopScorers } from '../api-football/provider.js'

export async function runNightlySync() {
  const db = getDb()
  const [live, predictions] = await Promise.all([fetchLiveStandingsAndTopScorers(), getPredictionsForSeason()])
  const leaderboard = computeLeaderboard(predictions, live.standings, live.topScorers)

  return db.transaction(async (tx) => {
    const existingStandings = await tx.query.standingsSnapshots.findFirst({
      where: and(eq(standingsSnapshots.season, APP_SEASON), eq(standingsSnapshots.roundNumber, live.roundNumber)),
    })

    if (existingStandings) {
      return {
        inserted: false,
        roundNumber: live.roundNumber,
        standingsSnapshotId: existingStandings.id,
      }
    }

    const standingsSnapshotId = (
      await tx
        .insert(standingsSnapshots)
        .values({
          season: APP_SEASON,
          leagueName: LEAGUE_NAME,
          source: live.source,
          roundNumber: live.roundNumber,
          capturedAt: new Date(live.capturedAt),
        })
        .returning({ id: standingsSnapshots.id })
    )[0].id

    await tx.insert(standingsSnapshotRows).values(
      live.standings.map((row) => ({
        snapshotId: standingsSnapshotId,
        teamName: row.teamName,
        position: row.position,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        points: row.points,
      })),
    )

    const topScorerSnapshotId = (
      await tx
        .insert(topScorerSnapshots)
        .values({
          season: APP_SEASON,
          leagueName: LEAGUE_NAME,
          source: live.source,
          roundNumber: live.roundNumber,
          capturedAt: new Date(live.capturedAt),
        })
        .returning({ id: topScorerSnapshots.id })
    )[0].id

    await tx.insert(topScorerSnapshotRows).values(
      live.topScorers.map((row) => ({
        snapshotId: topScorerSnapshotId,
        rank: row.rank,
        playerName: row.playerName,
        teamName: row.teamName ?? 'Unknown',
        goals: row.goals,
      })),
    )

    await tx.insert(participantScores).values(
      leaderboard.map((row) => ({
        standingsSnapshotId,
        participantId: row.participantId,
        participantName: row.participantName,
        totalPoints: row.totalPoints,
        ranking: row.ranking,
        beerDebt: row.beerDebt,
        exactHits: row.exactHits,
        nearHits: row.nearHits,
        penaltyPoints: row.penaltyPoints,
        championBonus: row.championBonus,
        relegationBonus: row.relegationBonus,
        tiebreakScore: row.tiebreakScore,
      })),
    )

    return {
      inserted: true,
      roundNumber: live.roundNumber,
      standingsSnapshotId,
    }
  })
}
