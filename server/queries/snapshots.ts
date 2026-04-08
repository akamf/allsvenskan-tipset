import { asc, eq } from 'drizzle-orm'
import { APP_SEASON } from '../constants'
import { getDb } from '../db/client'
import {
  participantScores,
  standingsSnapshotRows,
  standingsSnapshots,
  topScorerSnapshotRows,
  topScorerSnapshots,
} from '../db/schema'

export async function getLatestStandingsSnapshot() {
  const db = getDb()
  const snapshot = await db.query.standingsSnapshots.findFirst({
    where: eq(standingsSnapshots.season, APP_SEASON),
    orderBy: (table, { desc }) => [desc(table.roundNumber)],
  })

  if (!snapshot) {
    return null
  }

  const rows = await db.query.standingsSnapshotRows.findMany({
    where: eq(standingsSnapshotRows.snapshotId, snapshot.id),
    orderBy: (table, { asc }) => [asc(table.position)],
  })

  return { snapshot, rows }
}

export async function getLatestTopScorerSnapshot() {
  const db = getDb()
  const snapshot = await db.query.topScorerSnapshots.findFirst({
    where: eq(topScorerSnapshots.season, APP_SEASON),
    orderBy: (table, { desc }) => [desc(table.roundNumber)],
  })

  if (!snapshot) {
    return null
  }

  const rows = await db.query.topScorerSnapshotRows.findMany({
    where: eq(topScorerSnapshotRows.snapshotId, snapshot.id),
    orderBy: (table, { asc }) => [asc(table.rank)],
  })

  return { snapshot, rows }
}

export async function getAllSnapshotHistory() {
  const db = getDb()
  const standings = await db.query.standingsSnapshots.findMany({
    where: eq(standingsSnapshots.season, APP_SEASON),
    orderBy: (table, { asc }) => [asc(table.roundNumber)],
    with: {
      rows: {
        orderBy: (table, { asc }) => [asc(table.position)],
      },
    },
  })

  const scorers = await db.query.topScorerSnapshots.findMany({
    where: eq(topScorerSnapshots.season, APP_SEASON),
    orderBy: (table, { asc }) => [asc(table.roundNumber)],
    with: {
      rows: {
        orderBy: (table, { asc }) => [asc(table.rank)],
      },
    },
  })

  const scoreRows = await db
    .select({
      snapshotId: participantScores.standingsSnapshotId,
      ranking: participantScores.ranking,
      totalPoints: participantScores.totalPoints,
      participantName: participantScores.participantName,
      participantId: participantScores.participantId,
      roundNumber: standingsSnapshots.roundNumber,
      capturedAt: standingsSnapshots.capturedAt,
    })
    .from(participantScores)
    .innerJoin(standingsSnapshots, eq(standingsSnapshots.id, participantScores.standingsSnapshotId))
    .where(eq(standingsSnapshots.season, APP_SEASON))
    .orderBy(asc(standingsSnapshots.roundNumber), asc(participantScores.ranking))

  return { standings, scorers, scoreRows }
}
