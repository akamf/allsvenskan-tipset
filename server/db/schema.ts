import { relations } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export const standingsSnapshots = pgTable(
  'standings_snapshots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    season: integer('season').notNull(),
    leagueName: text('league_name').notNull(),
    source: text('source').notNull(),
    roundNumber: integer('round_number').notNull(),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    seasonRoundUnique: uniqueIndex('standings_snapshots_season_round_unique').on(table.season, table.roundNumber),
    seasonRoundIdx: index('standings_snapshots_season_round_idx').on(table.season, table.roundNumber),
  }),
)

export const standingsSnapshotRows = pgTable(
  'standings_snapshot_rows',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    snapshotId: uuid('snapshot_id').references(() => standingsSnapshots.id, { onDelete: 'cascade' }).notNull(),
    teamName: text('team_name').notNull(),
    position: integer('position').notNull(),
    played: integer('played').notNull(),
    won: integer('won').notNull(),
    drawn: integer('drawn').notNull(),
    lost: integer('lost').notNull(),
    goalsFor: integer('goals_for').notNull(),
    goalsAgainst: integer('goals_against').notNull(),
    goalDifference: integer('goal_difference').notNull(),
    points: integer('points').notNull(),
  },
  (table) => ({
    snapshotTeamUnique: uniqueIndex('standings_snapshot_rows_snapshot_team_unique').on(table.snapshotId, table.teamName),
  }),
)

export const topScorerSnapshots = pgTable(
  'top_scorer_snapshots',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    season: integer('season').notNull(),
    leagueName: text('league_name').notNull(),
    source: text('source').notNull(),
    roundNumber: integer('round_number').notNull(),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    seasonRoundUnique: uniqueIndex('top_scorer_snapshots_season_round_unique').on(table.season, table.roundNumber),
    seasonRoundIdx: index('top_scorer_snapshots_season_round_idx').on(table.season, table.roundNumber),
  }),
)

export const topScorerSnapshotRows = pgTable(
  'top_scorer_snapshot_rows',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    snapshotId: uuid('snapshot_id').references(() => topScorerSnapshots.id, { onDelete: 'cascade' }).notNull(),
    rank: integer('rank').notNull(),
    playerName: text('player_name').notNull(),
    teamName: text('team_name').notNull(),
    goals: integer('goals').notNull(),
  },
  (table) => ({
    snapshotRankUnique: uniqueIndex('top_scorer_snapshot_rows_snapshot_rank_unique').on(table.snapshotId, table.rank),
  }),
)

export const participantScores = pgTable(
  'participant_scores',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    standingsSnapshotId: uuid('standings_snapshot_id').references(() => standingsSnapshots.id, { onDelete: 'cascade' }).notNull(),
    participantId: text('participant_id').notNull(),
    participantName: text('participant_name').notNull(),
    totalPoints: integer('total_points').notNull(),
    ranking: integer('ranking').notNull(),
    beerDebt: integer('beer_debt').notNull(),
    exactHits: integer('exact_hits').notNull(),
    nearHits: integer('near_hits').notNull(),
    penaltyPoints: integer('penalty_points').notNull(),
    championBonus: integer('champion_bonus').notNull(),
    relegationBonus: integer('relegation_bonus').notNull(),
    tiebreakScore: integer('tiebreak_score').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    snapshotParticipantUnique: uniqueIndex('participant_scores_snapshot_participant_unique').on(
      table.standingsSnapshotId,
      table.participantId,
    ),
    snapshotRankingIdx: index('participant_scores_snapshot_ranking_idx').on(table.standingsSnapshotId, table.ranking),
  }),
)

export const standingsSnapshotsRelations = relations(standingsSnapshots, ({ many }) => ({
  rows: many(standingsSnapshotRows),
  scores: many(participantScores),
}))

export const standingsSnapshotRowsRelations = relations(standingsSnapshotRows, ({ one }) => ({
  snapshot: one(standingsSnapshots, {
    fields: [standingsSnapshotRows.snapshotId],
    references: [standingsSnapshots.id],
  }),
}))

export const topScorerSnapshotsRelations = relations(topScorerSnapshots, ({ many }) => ({
  rows: many(topScorerSnapshotRows),
}))

export const topScorerSnapshotRowsRelations = relations(topScorerSnapshotRows, ({ one }) => ({
  snapshot: one(topScorerSnapshots, {
    fields: [topScorerSnapshotRows.snapshotId],
    references: [topScorerSnapshots.id],
  }),
}))

export const participantScoresRelations = relations(participantScores, ({ one }) => ({
  snapshot: one(standingsSnapshots, {
    fields: [participantScores.standingsSnapshotId],
    references: [standingsSnapshots.id],
  }),
}))
