import { eq } from 'drizzle-orm'
import { APP_SEASON, LEAGUE_NAME } from '../constants'
import { getDb } from '../db/client'
import {
  participantScores,
  standingsSnapshotRows,
  standingsSnapshots,
  topScorerSnapshotRows,
  topScorerSnapshots,
} from '../db/schema'
import { getPredictionsForSeason } from '../queries/predictions'
import { computeLeaderboard } from '../scoring/leaderboard'
import type { NormalizedStanding, NormalizedTopScorer } from '../types'

const rounds = [
  {
    roundNumber: 1,
    capturedAt: '2026-03-30T21:00:00.000Z',
    standings: [
      ['Hammarby', 1, 1, 1, 0, 0, 2, 0, 2, 3],
      ['Djurgården', 2, 1, 1, 0, 0, 2, 1, 1, 3],
      ['Mjällby', 3, 1, 1, 0, 0, 1, 0, 1, 3],
      ['Malmö FF', 4, 1, 1, 0, 0, 1, 0, 1, 3],
      ['IFK Göteborg', 5, 1, 0, 1, 0, 1, 1, 0, 1],
      ['AIK', 6, 1, 0, 1, 0, 1, 1, 0, 1],
      ['Elfsborg', 7, 1, 0, 1, 0, 0, 0, 0, 1],
      ['GAIS', 8, 1, 0, 1, 0, 0, 0, 0, 1],
      ['Sirius', 9, 1, 0, 1, 0, 0, 0, 0, 1],
      ['Häcken', 10, 1, 0, 1, 0, 0, 0, 0, 1],
      ['Västerås', 11, 1, 0, 0, 1, 0, 1, -1, 0],
      ['Brommapojkarna', 12, 1, 0, 0, 1, 0, 1, -1, 0],
      ['Halmstad', 13, 1, 0, 0, 1, 0, 1, -1, 0],
      ['Kalmar FF', 14, 1, 0, 0, 1, 0, 1, -1, 0],
      ['Örgryte', 15, 1, 0, 0, 1, 0, 2, -2, 0],
      ['Degerfors', 16, 1, 0, 0, 1, 0, 2, -2, 0],
    ] satisfies Array<[string, number, number, number, number, number, number, number, number, number]>,
    scorers: [
      [1, 'Paulos Abraham', 'Djurgården', 1],
      [2, 'Nahir Besara', 'Hammarby', 1],
      [3, 'Kristian Lien', 'Mjällby', 1],
      [4, 'Max Fenger', 'Malmö FF', 1],
      [5, 'M. Tolf', 'IFK Göteborg', 1],
    ] satisfies Array<[number, string, string, number]>,
  },
  {
    roundNumber: 3,
    capturedAt: '2026-04-06T21:00:00.000Z',
    standings: [
      ['Hammarby', 1, 3, 2, 1, 0, 6, 2, 4, 7],
      ['Mjällby', 2, 3, 2, 0, 1, 5, 3, 2, 6],
      ['Djurgården', 3, 3, 2, 0, 1, 4, 2, 2, 6],
      ['Malmö FF', 4, 3, 1, 2, 0, 5, 3, 2, 5],
      ['IFK Göteborg', 5, 3, 1, 1, 1, 4, 4, 0, 4],
      ['GAIS', 6, 3, 1, 1, 1, 3, 3, 0, 4],
      ['AIK', 7, 3, 1, 1, 1, 3, 4, -1, 4],
      ['Elfsborg', 8, 3, 1, 0, 2, 5, 6, -1, 3],
      ['Sirius', 9, 3, 1, 0, 2, 4, 5, -1, 3],
      ['Häcken', 10, 3, 1, 0, 2, 3, 5, -2, 3],
      ['Brommapojkarna', 11, 3, 0, 2, 1, 3, 4, -1, 2],
      ['Kalmar FF', 12, 3, 0, 2, 1, 2, 3, -1, 2],
      ['Halmstad', 13, 3, 0, 2, 1, 2, 4, -2, 2],
      ['Västerås', 14, 3, 0, 1, 2, 2, 5, -3, 1],
      ['Degerfors', 15, 3, 0, 1, 2, 1, 5, -4, 1],
      ['Örgryte', 16, 3, 0, 1, 2, 1, 6, -5, 1],
    ] satisfies Array<[string, number, number, number, number, number, number, number, number, number]>,
    scorers: [
      [1, 'P. Abraham', 'Djurgården', 4],
      [2, 'Nahir Besara', 'Hammarby', 3],
      [3, 'A. Lien', 'Mjällby', 3],
      [4, 'Fenger', 'Malmö FF', 2],
      [5, 'Svanberg', 'IFK Göteborg', 2],
    ] satisfies Array<[number, string, string, number]>,
  },
  {
    roundNumber: 7,
    capturedAt: '2026-05-04T21:00:00.000Z',
    standings: [
      ['Hammarby', 1, 7, 5, 1, 1, 13, 6, 7, 16],
      ['Djurgården', 2, 7, 4, 2, 1, 12, 7, 5, 14],
      ['Mjällby', 3, 7, 4, 1, 2, 10, 6, 4, 13],
      ['Malmö FF', 4, 7, 3, 3, 1, 11, 7, 4, 12],
      ['IFK Göteborg', 5, 7, 3, 2, 2, 9, 8, 1, 11],
      ['AIK', 6, 7, 3, 2, 2, 8, 7, 1, 11],
      ['Elfsborg', 7, 7, 3, 1, 3, 10, 9, 1, 10],
      ['GAIS', 8, 7, 2, 3, 2, 8, 8, 0, 9],
      ['Sirius', 9, 7, 2, 2, 3, 9, 10, -1, 8],
      ['Häcken', 10, 7, 2, 2, 3, 8, 10, -2, 8],
      ['Västerås', 11, 7, 2, 1, 4, 7, 11, -4, 7],
      ['Brommapojkarna', 12, 7, 2, 1, 4, 7, 12, -5, 7],
      ['Halmstad', 13, 7, 1, 3, 3, 6, 10, -4, 6],
      ['Kalmar FF', 14, 7, 1, 2, 4, 5, 10, -5, 5],
      ['Örgryte', 15, 7, 1, 1, 5, 5, 12, -7, 4],
      ['Degerfors', 16, 7, 1, 1, 5, 4, 13, -9, 4],
    ] satisfies Array<[string, number, number, number, number, number, number, number, number, number]>,
    scorers: [
      [1, 'P. Abraham', 'Djurgården', 7],
      [2, 'Nahir Besara', 'Hammarby', 6],
      [3, 'A. Lien', 'Mjällby', 5],
      [4, 'Fenger', 'Malmö FF', 4],
      [5, 'Y. Sema', 'Häcken', 4],
    ] satisfies Array<[number, string, string, number]>,
  },
  {
    roundNumber: 12,
    capturedAt: '2026-06-15T21:00:00.000Z',
    standings: [
      ['Hammarby', 1, 12, 8, 2, 2, 23, 11, 12, 26],
      ['Mjällby', 2, 12, 7, 2, 3, 18, 12, 6, 23],
      ['Djurgården', 3, 12, 7, 1, 4, 21, 14, 7, 22],
      ['Malmö FF', 4, 12, 6, 3, 3, 19, 13, 6, 21],
      ['IFK Göteborg', 5, 12, 5, 3, 4, 17, 15, 2, 18],
      ['AIK', 6, 12, 5, 3, 4, 15, 14, 1, 18],
      ['Elfsborg', 7, 12, 5, 2, 5, 18, 18, 0, 17],
      ['GAIS', 8, 12, 4, 4, 4, 16, 16, 0, 16],
      ['Sirius', 9, 12, 4, 3, 5, 17, 19, -2, 15],
      ['Häcken', 10, 12, 4, 2, 6, 15, 18, -3, 14],
      ['Västerås', 11, 12, 3, 3, 6, 13, 18, -5, 12],
      ['Brommapojkarna', 12, 12, 3, 3, 6, 12, 18, -6, 12],
      ['Halmstad', 13, 12, 3, 2, 7, 10, 17, -7, 11],
      ['Kalmar FF', 14, 12, 2, 4, 6, 11, 19, -8, 10],
      ['Örgryte', 15, 12, 2, 2, 8, 10, 21, -11, 8],
      ['Degerfors', 16, 12, 2, 1, 9, 8, 23, -15, 7],
    ] satisfies Array<[string, number, number, number, number, number, number, number, number, number]>,
    scorers: [
      [1, 'P. Abraham', 'Djurgården', 10],
      [2, 'Nahir Besara', 'Hammarby', 9],
      [3, 'A. Lien', 'Mjällby', 8],
      [4, 'Fenger', 'Malmö FF', 7],
      [5, 'Y. Sema', 'Häcken', 6],
    ] satisfies Array<[number, string, string, number]>,
  },
  {
    roundNumber: 18,
    capturedAt: '2026-08-10T21:00:00.000Z',
    standings: [
      ['Hammarby', 1, 18, 12, 3, 3, 33, 16, 17, 39],
      ['Djurgården', 2, 18, 11, 3, 4, 31, 20, 11, 36],
      ['Mjällby', 3, 18, 10, 4, 4, 28, 19, 9, 34],
      ['Malmö FF', 4, 18, 9, 4, 5, 27, 20, 7, 31],
      ['IFK Göteborg', 5, 18, 8, 4, 6, 24, 22, 2, 28],
      ['AIK', 6, 18, 8, 4, 6, 22, 21, 1, 28],
      ['Elfsborg', 7, 18, 7, 5, 6, 25, 24, 1, 26],
      ['GAIS', 8, 18, 7, 4, 7, 23, 23, 0, 25],
      ['Sirius', 9, 18, 6, 5, 7, 24, 27, -3, 23],
      ['Häcken', 10, 18, 6, 4, 8, 22, 26, -4, 22],
      ['Västerås', 11, 18, 5, 4, 9, 19, 27, -8, 19],
      ['Brommapojkarna', 12, 18, 5, 4, 9, 18, 28, -10, 19],
      ['Halmstad', 13, 18, 4, 5, 9, 16, 25, -9, 17],
      ['Kalmar FF', 14, 18, 4, 4, 10, 16, 28, -12, 16],
      ['Örgryte', 15, 18, 3, 4, 11, 15, 31, -16, 13],
      ['Degerfors', 16, 18, 3, 3, 12, 13, 33, -20, 12],
    ] satisfies Array<[string, number, number, number, number, number, number, number, number, number]>,
    scorers: [
      [1, 'P. Abraham', 'Djurgården', 13],
      [2, 'Nahir Besara', 'Hammarby', 11],
      [3, 'A. Lien', 'Mjällby', 10],
      [4, 'Fenger', 'Malmö FF', 9],
      [5, 'Y. Sema', 'Häcken', 8],
    ] satisfies Array<[number, string, string, number]>,
  },
] as const

function toStandingRows(rows: (typeof rounds)[number]['standings']): NormalizedStanding[] {
  return rows.map(([teamName, position, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points]) => ({
    teamName: teamName as NormalizedStanding['teamName'],
    position,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDifference,
    points,
  }))
}

function toTopScorerRows(rows: (typeof rounds)[number]['scorers']): NormalizedTopScorer[] {
  return rows.map(([rank, playerName, teamName, goals]) => ({
    rank,
    playerName,
    teamName: teamName as NonNullable<NormalizedTopScorer['teamName']>,
    goals,
  }))
}

export async function seedLocalHistory() {
  const db = getDb()
  const predictions = await getPredictionsForSeason()

  return db.transaction(async (tx) => {
    await tx.delete(topScorerSnapshots).where(eq(topScorerSnapshots.season, APP_SEASON))
    await tx.delete(standingsSnapshots).where(eq(standingsSnapshots.season, APP_SEASON))

    for (const round of rounds) {
      const standings = toStandingRows(round.standings)
      const scorers = toTopScorerRows(round.scorers)
      const leaderboard = computeLeaderboard(predictions, standings, scorers)

      const standingsSnapshotId = (
        await tx
          .insert(standingsSnapshots)
          .values({
            season: APP_SEASON,
            leagueName: LEAGUE_NAME,
            source: 'seed',
            roundNumber: round.roundNumber,
            capturedAt: new Date(round.capturedAt),
          })
          .returning({ id: standingsSnapshots.id })
      )[0].id

      await tx.insert(standingsSnapshotRows).values(
        standings.map((row) => ({
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
            source: 'seed',
            roundNumber: round.roundNumber,
            capturedAt: new Date(round.capturedAt),
          })
          .returning({ id: topScorerSnapshots.id })
      )[0].id

      await tx.insert(topScorerSnapshotRows).values(
        scorers.map((row) => ({
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
    }

    return {
      season: APP_SEASON,
      roundsSeeded: rounds.map((round) => round.roundNumber),
    }
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedLocalHistory()
    .then((result) => {
      console.info('[seed-local-history] done', result)
      process.exit(0)
    })
    .catch((error) => {
      console.error('[seed-local-history] failed', error)
      process.exit(1)
    })
}
