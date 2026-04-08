import { z } from 'zod'
import { CANONICAL_TEAMS } from './constants.js'

export const canonicalTeamSchema = z.enum(CANONICAL_TEAMS)

export const liveStandingRowSchema = z.object({
  teamId: z.number().int(),
  teamName: z.string(),
  teamLogo: z.string(),
  position: z.number().int().min(1).max(16),
  played: z.number().int().min(0),
  won: z.number().int().min(0),
  drawn: z.number().int().min(0),
  lost: z.number().int().min(0),
  goalsFor: z.number().int(),
  goalsAgainst: z.number().int(),
  goalDifference: z.number().int(),
  points: z.number().int(),
  form: z.string().nullable(),
  status: z.string().nullable(),
  description: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export const normalizedStandingSchema = z.object({
  teamName: canonicalTeamSchema,
  position: z.number().int().min(1).max(16),
  played: z.number().int().min(0),
  won: z.number().int().min(0),
  drawn: z.number().int().min(0),
  lost: z.number().int().min(0),
  goalsFor: z.number().int(),
  goalsAgainst: z.number().int(),
  goalDifference: z.number().int(),
  points: z.number().int(),
})

export const normalizedTopScorerSchema = z.object({
  rank: z.number().int().min(1),
  playerName: z.string(),
  teamName: canonicalTeamSchema.optional().nullable(),
  goals: z.number().int().min(0),
})

export const normalizedPredictionRowSchema = z.object({
  teamName: canonicalTeamSchema,
  predictedPosition: z.number().int().min(1).max(16),
})

export const normalizedPredictionSchema = z.object({
  predictionId: z.string(),
  participantId: z.string(),
  participantName: z.string(),
  predictedTopScorer: z.string(),
  rows: z.array(normalizedPredictionRowSchema),
})

export const participantScoreSchema = z.object({
  participantId: z.string(),
  participantName: z.string(),
  standingsSnapshotId: z.string(),
  totalPoints: z.number(),
  ranking: z.number(),
  beerDebt: z.number(),
  exactHits: z.number(),
  nearHits: z.number(),
  penaltyPoints: z.number(),
  championBonus: z.number(),
  relegationBonus: z.number(),
  tiebreakScore: z.number(),
})

export type NormalizedStanding = z.infer<typeof normalizedStandingSchema>
export type LiveStandingRow = z.infer<typeof liveStandingRowSchema>
export type NormalizedTopScorer = z.infer<typeof normalizedTopScorerSchema>
export type NormalizedPrediction = z.infer<typeof normalizedPredictionSchema>
export type ParticipantScore = z.infer<typeof participantScoreSchema>
