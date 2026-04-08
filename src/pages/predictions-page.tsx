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
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>{participant.participantName}</CardTitle>
                <Badge>{participant.rows[0]?.predictedPosition === 1 ? 'Title pick' : 'Prediction'}</Badge>
              </div>
              <CardDescription>
                Predicted top scorer: {scorerDisplayName}
                {liveMatch ? ` (${liveMatch.goals} goals)` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
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
                      <TableCell className="py-2">{row.predictedPosition}</TableCell>
                      <TableCell>{toDisplayTeamName(row.teamName)}</TableCell>
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
