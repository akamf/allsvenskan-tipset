import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SeriesChart } from '@/components/dashboard/series-chart'
import { HistoryTableCard } from '@/components/pages/history-table-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, ApiError } from '@/lib/api'
import { formatDateTime } from '@/lib/format'
import { toDisplayTeamName } from '@/lib/team-display'

export function HistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['history'],
    queryFn: api.history,
  })
  const [selectedRound, setSelectedRound] = useState<number | null>(null)

  if (isLoading) {
    return <div className="text-sm text-[#655640]">Loading history…</div>
  }

  if (error || !data) {
    return <div className="text-sm text-[#9b4e47]">{error instanceof ApiError ? error.message : 'History could not be loaded.'}</div>
  }

  const activeRound = selectedRound ?? data.rounds.at(-1) ?? null
  const activeStandings = data.standingsSnapshots.find((snapshot) => snapshot.roundNumber === activeRound)
  const activeScorers = data.topScorerSnapshots.find((snapshot) => snapshot.roundNumber === activeRound)

  return (
    <div className="space-y-6">
      <Card className="bg-[#647b58]">
        <CardHeader>
          <CardTitle>Stored round snapshots</CardTitle>
          <CardDescription>Select a round to inspect the saved standings and scorer snapshots.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.rounds.map((round) => (
            <button
              key={round}
              className={`rounded-full border px-4 py-2 text-sm ${round === activeRound ? 'border-[#ede4d1]/35 bg-[#ede4d1] text-[#33402e]' : 'border-[#d8c6aa]/25 bg-[#516549] text-[#efe6d8]'}`}
              onClick={() => setSelectedRound(round)}
              type="button"
            >
              Round {round}
            </button>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="standings">
        <TabsList className="flex w-full overflow-x-auto sm:w-auto">
          <TabsTrigger
            className="shrink-0 px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
            value="standings"
          >
            Standings
          </TabsTrigger>
          <TabsTrigger
            className="shrink-0 px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
            value="scorers"
          >
            Top scorers
          </TabsTrigger>
          <TabsTrigger
            className="shrink-0 px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
            value="charts"
          >
            Progression
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standings">
          <HistoryTableCard
            title={`Standings snapshot · round ${activeRound ?? '-'}`}
            description={activeStandings ? formatDateTime(activeStandings.capturedAt) : 'No snapshot'}
            headers={['#', 'Team', 'P', 'GD', 'Pts']}
            rows={activeStandings?.rows.map((row) => [row.position, toDisplayTeamName(row.teamName), row.played, row.goalDifference, row.points]) ?? []}
          />
        </TabsContent>

        <TabsContent value="scorers">
          <HistoryTableCard
            title={`Top scorer snapshot · round ${activeRound ?? '-'}`}
            description={activeScorers ? formatDateTime(activeScorers.capturedAt) : 'No snapshot'}
            headers={['#', 'Player', 'Team', 'Goals']}
            rows={activeScorers?.rows.map((row) => [row.rank, row.playerName, toDisplayTeamName(row.teamName), row.goals]) ?? []}
          />
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid gap-6 xl:grid-cols-2">
            <SeriesChart title="Points progression" description="Stored scores by round." data={data.charts.points} />
            <SeriesChart
              title="Ranking progression"
              description="Stored rankings by round."
              data={data.charts.rankings}
              invertYAxis
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
