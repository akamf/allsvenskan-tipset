import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Stat } from '@/components/pages/stat'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'

export function ParticipantPage() {
  const { participantId } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['participant', participantId],
    queryFn: () => api.participant(participantId ?? ''),
    enabled: Boolean(participantId),
  })

  if (isLoading) {
    return <div className="text-sm text-slate-400">Loading participant…</div>
  }

  if (error || !data) {
    return <div className="text-sm text-rose-300">Participant details could not be loaded.</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{data.participant.name}</CardTitle>
            <Badge variant={data.latestScore.ranking === 1 ? 'success' : data.latestScore.ranking === 5 ? 'destructive' : 'default'}>
              Rank {data.latestScore.ranking}
            </Badge>
          </div>
          <CardDescription>
            Predicted top scorer: {data.participant.predictedTopScorer}
            {data.participant.livePredictedTopScorerRank !== null
              ? ` · live rank ${data.participant.livePredictedTopScorerRank} · ${data.participant.livePredictedTopScorerGoals} goals`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Total points" value={data.latestScore.totalPoints} />
          <Stat label="Beer debt" value={data.latestScore.beerDebt} />
          <Stat label="Tiebreak score" value={data.latestScore.tiebreakScore} />
          <Stat label="Exact / near hits" value={`${data.latestScore.exactHits} / ${data.latestScore.nearHits}`} />
          <Stat label="Penalty points" value={data.latestScore.penaltyPoints} />
          <Stat label="Champion bonus" value={data.latestScore.championBonus} />
          <Stat label="Relegation bonus" value={data.latestScore.relegationBonus} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-team breakdown</CardTitle>
          <CardDescription>How the latest standings translate into points for this participant.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="w-max sm:w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Predicted</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.teamBreakdown.map((row) => (
                <TableRow key={row.teamName}>
                  <TableCell>{row.teamName}</TableCell>
                  <TableCell>{row.predictedPosition}</TableCell>
                  <TableCell>{row.actualPosition}</TableCell>
                  <TableCell>{row.distance}</TableCell>
                  <TableCell>{row.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
