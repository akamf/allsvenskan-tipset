import { getAllSnapshotHistory } from '../queries/snapshots.js'
import { buildCharts } from './chart-series.js'

export async function getHistoryData() {
  console.info('[history] DB history query started')
  const history = await getAllSnapshotHistory()
  console.info('[history] DB history query success')

  return {
    rounds: history.standings.map((snapshot) => snapshot.roundNumber),
    standingsSnapshots: history.standings.map((snapshot) => ({
      snapshotId: snapshot.id,
      roundNumber: snapshot.roundNumber,
      capturedAt: snapshot.capturedAt.toISOString(),
      rows: snapshot.rows.map((row) => ({
        teamId: 0,
        teamName: row.teamName,
        teamLogo: '',
        position: row.position,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        points: row.points,
        form: null,
        status: null,
        description: null,
        updatedAt: snapshot.capturedAt.toISOString(),
      })),
    })),
    topScorerSnapshots: history.scorers.map((snapshot) => ({
      snapshotId: snapshot.id,
      roundNumber: snapshot.roundNumber,
      capturedAt: snapshot.capturedAt.toISOString(),
      rows: snapshot.rows.map((row) => ({
        rank: row.rank,
        playerName: row.playerName,
        teamName: row.teamName,
        goals: row.goals,
      })),
    })),
    charts: buildCharts(history.scoreRows),
  }
}
