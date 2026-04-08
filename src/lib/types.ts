import { z } from 'zod'

export const standingsRowSchema = z.object({
  teamId: z.number().optional().default(0),
  teamName: z.string(),
  teamLogo: z.string().optional().default(''),
  position: z.number(),
  played: z.number(),
  won: z.number(),
  drawn: z.number(),
  lost: z.number(),
  goalsFor: z.number(),
  goalsAgainst: z.number(),
  goalDifference: z.number(),
  points: z.number(),
  form: z.string().nullable().optional().default(null),
  status: z.string().nullable().optional().default(null),
  description: z.string().nullable().optional().default(null),
  updatedAt: z.string().nullable().optional().default(null),
})

export const topScorerRowSchema = z.object({
  rank: z.number(),
  playerName: z.string(),
  teamName: z.string(),
  goals: z.number(),
})

export const statusSchema = z.object({
  liveApiAvailable: z.boolean(),
  fallbackUsed: z.boolean(),
  mode: z.enum(['live', 'fallback']),
  latestSyncAt: z.string().nullable(),
  roundNumber: z.number().nullable(),
  source: z.string(),
})

export const leaderboardRowSchema = z.object({
  participantId: z.string(),
  participantName: z.string(),
  ranking: z.number(),
  totalPoints: z.number(),
  beerDebt: z.number(),
  tiebreakScore: z.number(),
  exactHits: z.number(),
  nearHits: z.number(),
  penaltyPoints: z.number(),
  championBonus: z.number(),
  relegationBonus: z.number(),
  predictedTopScorer: z.string(),
  livePredictedTopScorerName: z.string().nullable().optional().default(null),
  livePredictedTopScorerGoals: z.number().nullable(),
  livePredictedTopScorerRank: z.number().nullable(),
})

export const chartPointSchema = z.object({
  round: z.number(),
  capturedAt: z.string(),
}).catchall(z.union([z.number(), z.string()]))

export const dashboardResponseSchema = z.object({
  folderStructure: z.array(z.string()),
  schemaSummary: z.array(z.string()),
  apiDesign: z.array(z.string()),
  cronFlow: z.array(z.string()),
  status: statusSchema,
  summary: z.object({
    leaderName: z.string().nullable(),
    lastPlaceName: z.string().nullable(),
    latestSyncAt: z.string().nullable(),
    currentRound: z.number().nullable(),
  }),
  standings: z.array(standingsRowSchema),
  topScorers: z.array(topScorerRowSchema),
  leaderboard: z.array(leaderboardRowSchema),
  beerDebtTable: z.array(
    z.object({
      participantId: z.string(),
      participantName: z.string(),
      beerDebt: z.number(),
      ranking: z.number(),
    }),
  ),
  charts: z.object({
    rankings: z.array(chartPointSchema),
    points: z.array(chartPointSchema),
  }),
})

export const predictionsResponseSchema = z.object({
  participants: z.array(
    z.object({
      participantId: z.string(),
      participantName: z.string(),
      predictedTopScorer: z.string(),
      livePredictedTopScorerGoals: z.number().nullable(),
      predictedRows: z.array(
        z.object({
          teamName: z.string(),
          predictedPosition: z.number(),
        }),
      ),
    }),
  ),
})

export const historyResponseSchema = z.object({
  rounds: z.array(z.number()),
  standingsSnapshots: z.array(
    z.object({
      snapshotId: z.string(),
      roundNumber: z.number(),
      capturedAt: z.string(),
      rows: z.array(standingsRowSchema),
    }),
  ),
  topScorerSnapshots: z.array(
    z.object({
      snapshotId: z.string(),
      roundNumber: z.number(),
      capturedAt: z.string(),
      rows: z.array(topScorerRowSchema),
    }),
  ),
  charts: z.object({
    rankings: z.array(chartPointSchema),
    points: z.array(chartPointSchema),
  }),
})

export const participantDetailResponseSchema = z.object({
  participant: z.object({
    id: z.string(),
    name: z.string(),
    predictedTopScorer: z.string(),
    livePredictedTopScorerName: z.string().nullable(),
    livePredictedTopScorerGoals: z.number().nullable(),
    livePredictedTopScorerRank: z.number().nullable(),
  }),
  latestScore: leaderboardRowSchema,
  teamBreakdown: z.array(
    z.object({
      teamName: z.string(),
      predictedPosition: z.number(),
      actualPosition: z.number(),
      distance: z.number(),
      points: z.number(),
    }),
  ),
})

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>
export type PredictionsResponse = z.infer<typeof predictionsResponseSchema>
export type HistoryResponse = z.infer<typeof historyResponseSchema>
export type ParticipantDetailResponse = z.infer<typeof participantDetailResponseSchema>
