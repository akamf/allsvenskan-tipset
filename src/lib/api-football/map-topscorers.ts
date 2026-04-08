import { z } from 'zod'
import { normalizeApiFootballTeamName } from './normalize-team-name'

export type TopScorerRow = {
  rank: number
  playerName: string
  teamName: string
  goals: number
}

const topScorersSchema = z.object({
  response: z.array(
    z.object({
      player: z.object({
        name: z.string(),
      }),
      statistics: z.array(
        z.object({
          team: z.object({
            name: z.string(),
          }),
          goals: z.object({
            total: z.number().nullable(),
          }),
        }),
      ),
    }),
  ),
})

export function mapTopScorers(payload: unknown): TopScorerRow[] {
  const parsed = topScorersSchema.safeParse(payload)

  if (!parsed.success) {
    throw new Error('Malformed top scorers payload')
  }

  return parsed.data.response.slice(0, 10).map((row, index) => ({
    rank: index + 1,
    playerName: row.player.name,
    teamName: normalizeApiFootballTeamName(row.statistics[0]?.team.name ?? 'Unknown'),
    goals: row.statistics[0]?.goals.total ?? 0,
  }))
}
