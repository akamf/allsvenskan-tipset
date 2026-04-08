import { z } from 'zod'
import { normalizeApiFootballTeamName } from './normalize-team-name'

export type StandingRow = {
  teamName: string
  position: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

const standingsSchema = z.object({
  response: z.array(
    z.object({
      league: z.object({
        standings: z.array(
          z.array(
            z.object({
              rank: z.number(),
              team: z.object({
                name: z.string(),
                id: z.number().optional(),
                logo: z.string().optional(),
              }),
              points: z.number(),
              goalsDiff: z.number(),
              all: z.object({
                played: z.number(),
                win: z.number(),
                draw: z.number(),
                lose: z.number(),
                goals: z.object({
                  for: z.number(),
                  against: z.number(),
                }),
              }),
            }),
          ),
        ),
      }),
    }),
  ),
})

export function mapStandings(payload: unknown): StandingRow[] {
  const parsed = standingsSchema.safeParse(payload)

  if (!parsed.success) {
    throw new Error('Malformed standings payload')
  }

  const rows = parsed.data.response[0]?.league.standings[0]

  if (!rows) {
    return []
  }

  return rows.map((row) => ({
    teamName: normalizeApiFootballTeamName(row.team.name),
    position: row.rank,
    played: row.all.played,
    won: row.all.win,
    drawn: row.all.draw,
    lost: row.all.lose,
    goalsFor: row.all.goals.for,
    goalsAgainst: row.all.goals.against,
    goalDifference: row.goalsDiff,
    points: row.points,
  }))
}
