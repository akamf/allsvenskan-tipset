import { useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Circle, Siren } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardDataTableCard } from '@/components/pages/dashboard-data-table-card'
import { DashboardLiveStandingsCard } from '@/components/pages/dashboard-live-standings-card'
import { DashboardMetricCard } from '@/components/pages/dashboard-metric-card'
import { DashboardSkeleton } from '@/components/pages/dashboard-skeleton'
import { SeriesChart } from '@/components/dashboard/series-chart'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, ApiError } from '@/lib/api'
import { toPredictedScorerDisplayName } from '@/lib/predicted-scorers'
import { toDisplayTeamName } from '@/lib/team-display'

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard,
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <Card className="bg-[#607656]">
        <CardHeader>
          <CardTitle>Dashboard unavailable</CardTitle>
          <CardDescription>
            {error instanceof ApiError ? error.message : 'Server data could not be loaded.'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[#2d3527] sm:text-3xl">Dashboard</h2>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#9d8663]/35 bg-[#f6f0e4] px-3 py-1.5 text-xs font-medium text-[#655640]">
          <Circle
            className={`h-2.5 w-2.5 fill-current ${data.status.mode === 'live' ? 'text-[#6f845e]' : 'text-[#9b4e47]'}`}
          />
          {data.status.mode === 'live' ? 'Live' : 'Fallback'}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardMetricCard
          label="Current leader"
          value={data.summary.leaderName ?? 'N/A'}
          hint="Best current score"
          icon={ArrowUp}
        />
        <DashboardMetricCard
          label="Current loser"
          value={data.summary.lastPlaceName ?? 'N/A'}
          hint="Most beer owed"
          icon={ArrowDown}
        />
        <DashboardMetricCard
          label="Current round"
          value={String(data.summary.currentRound ?? '-')}
          hint={data.status.source}
          icon={Siren}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-6">
          <Card className="min-w-0 bg-[#586f50]">
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Current standings between the five participants.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="w-max sm:w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Debt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.leaderboard.map(row => (
                    <TableRow key={row.participantId}>
                      <TableCell>{row.ranking}</TableCell>
                      <TableCell>
                        <Link
                          className="font-medium text-white hover:text-[#f0e5d4]"
                          to={`/participants/${row.participantId}`}
                        >
                          {row.participantName}
                        </Link>
                      </TableCell>
                      <TableCell>{row.totalPoints}</TableCell>
                      <TableCell>{'🍺'.repeat(Math.max(0, Math.min(row.beerDebt ?? 0, 20)))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <DashboardDataTableCard
            title="Top scorers"
            description="Current scorer race for the tiebreak."
            headers={['#', 'Player', 'Team', 'Goals']}
            rows={data.topScorers.map(row => [row.rank, row.playerName, toDisplayTeamName(row.teamName), row.goals])}
          />
        </div>

        <DashboardLiveStandingsCard standings={data.standings} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SeriesChart
          title="Ranking over time"
          description="Lower is better. Historical ranking per snapshot."
          data={data.charts.rankings}
          invertYAxis
        />
        <SeriesChart
          title="Points over time"
          description="Total points progression per snapshot."
          data={data.charts.points}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="min-w-0 bg-[#5a7051]">
          <CardHeader>
            <CardTitle>Beer debt table</CardTitle>
            <CardDescription>Current rounds owed based on the latest rankings.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="w-max sm:w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Beer rounds</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.beerDebtTable.map(row => (
                  <TableRow key={row.participantId}>
                    <TableCell>{row.participantName}</TableCell>
                    <TableCell>{row.ranking}</TableCell>
                    <TableCell>{row.beerDebt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 bg-[#607656]">
          <CardHeader>
            <CardTitle>Prediction drill-down</CardTitle>
            <CardDescription>Open each participant for team-by-team scoring and tiebreak context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.leaderboard.map(row => (
              <Link
                key={row.participantId}
                to={`/participants/${row.participantId}`}
                className="flex flex-col gap-3 rounded-2xl border border-[#ecdcc7]/10 bg-[#f6eee0]/[0.06] px-4 py-3 transition hover:bg-[#f6eee0]/[0.1] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{row.participantName}</p>
                  <p className="text-sm text-[#ede2cf]/70">
                    Tiebreak {row.tiebreakScore} · Predicted scorer{' '}
                    {toPredictedScorerDisplayName(row.predictedTopScorer, row.livePredictedTopScorerName)}
                    {row.livePredictedTopScorerGoals !== null ? ` (${row.livePredictedTopScorerGoals} goals)` : ''}
                  </p>
                </div>
                <Badge variant={row.ranking === 1 ? 'success' : row.ranking === 5 ? 'destructive' : 'default'}>
                  Rank {row.ranking}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
