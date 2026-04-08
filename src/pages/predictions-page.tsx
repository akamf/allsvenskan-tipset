import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { staticPredictions } from '@/data/predictions'
import { api } from '@/lib/api'
import { findBestPlayerNameMatch } from '@/lib/player-name-match'
import { toPredictedScorerDisplayName } from '@/lib/predicted-scorers'
import { toDisplayTeamName } from '@/lib/team-display'

function findScorerMatch(name: string, rows: Array<{ playerName: string; goals: number }>) {
  return findBestPlayerNameMatch(name, rows) ?? null
}

export function PredictionsPage() {
  const { data } = useQuery({
    queryKey: ['dashboard-predictions-helper'],
    queryFn: api.dashboard,
    retry: false,
    staleTime: 60_000,
  })

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {staticPredictions.map((participant) => {
        const liveMatch = data ? findScorerMatch(participant.predictedTopScorer, data.topScorers) : null
        const scorerDisplayName = toPredictedScorerDisplayName(participant.predictedTopScorer, liveMatch?.playerName)

        return (
          <Card key={participant.participantId} className="bg-[#5e7453]">
            <CardHeader className="gap-1 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">{participant.participantName}</CardTitle>
                <Badge>{participant.rows[0]?.predictedPosition === 1 ? 'Title pick' : 'Prediction'}</Badge>
              </div>
              <CardDescription className="text-[13px] leading-snug">
                Predicted top scorer: {scorerDisplayName}
                {liveMatch ? ` (${liveMatch.goals} goals)` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Team</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participant.rows.map((row) => (
                    <TableRow key={`${participant.participantId}-${row.teamName}`}>
                      <TableCell className="w-8 py-1.5">{row.predictedPosition}</TableCell>
                      <TableCell className="py-1.5">{toDisplayTeamName(row.teamName)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
