import type React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Circle, Siren } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SeriesChart } from '@/components/dashboard/series-chart'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#2d3527]">Dashboard</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#9d8663]/35 bg-[#f6f0e4] px-3 py-1.5 text-xs font-medium text-[#655640]">
          <Circle className={`h-2.5 w-2.5 fill-current ${data.status.mode === 'live' ? 'text-[#6f845e]' : 'text-[#9b4e47]'}`} />
          {data.status.mode === 'live' ? 'Live' : 'Fallback'}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current leader" value={data.summary.leaderName ?? 'N/A'} hint="Best current score" icon={ArrowUp} />
        <MetricCard label="Current loser" value={data.summary.lastPlaceName ?? 'N/A'} hint="Most beer owed" icon={ArrowDown} />
        <MetricCard label="Current round" value={String(data.summary.currentRound ?? '-')} hint={data.status.source} icon={Siren} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-6">
          <Card className="bg-[#586f50]">
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Current standings between the five participants.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Debt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.leaderboard.map((row) => (
                    <TableRow key={row.participantId}>
                      <TableCell>{row.ranking}</TableCell>
                      <TableCell>
                        <Link className="font-medium text-white hover:text-[#f0e5d4]" to={`/participants/${row.participantId}`}>
                          {row.participantName}
                        </Link>
                      </TableCell>
                      <TableCell>{row.totalPoints}</TableCell>
                      <TableCell>{row.beerDebt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <DataTableCard
            title="Top scorers"
            description="Current scorer race for the tiebreak."
            headers={['#', 'Player', 'Team', 'Goals']}
            rows={data.topScorers.map((row) => [row.rank, row.playerName, toDisplayTeamName(row.teamName), row.goals])}
          />
        </div>

        <LiveStandingsCard standings={data.standings} />
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
        <Card className="bg-[#5a7051]">
          <CardHeader>
            <CardTitle>Beer debt table</CardTitle>
            <CardDescription>Current rounds owed based on the latest rankings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Beer rounds</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.beerDebtTable.map((row) => (
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

        <Card className="bg-[#607656]">
          <CardHeader>
            <CardTitle>Prediction drill-down</CardTitle>
            <CardDescription>Open each participant for team-by-team scoring and tiebreak context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.leaderboard.map((row) => (
              <Link
                key={row.participantId}
                to={`/participants/${row.participantId}`}
                className="flex items-center justify-between rounded-2xl border border-[#ecdcc7]/10 bg-[#f6eee0]/[0.06] px-4 py-3 transition hover:bg-[#f6eee0]/[0.1]"
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

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="bg-[#607656]">
      <CardContent className="flex min-h-[108px] items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f6eee0]/10">
          <Icon className="h-5 w-5 text-[#f1e5d3]" />
        </div>
        <div className="flex min-h-[52px] flex-col justify-center">
          <p className="text-sm text-[#efe6d8]/70">{label}</p>
          <p className="font-display text-xl font-semibold text-white">{value}</p>
          <p className="text-xs text-[#efe6d8]/50">{hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DataTableCard({
  title,
  description,
  headers,
  rows,
}: {
  title: string
  description: string
  headers: string[]
  rows: Array<Array<string | number>>
}) {
  return (
    <Card className="bg-[#5d7454]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.join('-')}>
                {row.map((cell, index) => (
                  <TableCell key={`${row.join('-')}-${index}`}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function LiveStandingsCard({
  standings,
}: {
  standings: Array<{
    teamId?: number
    teamName: string
    teamLogo?: string
    position: number
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    points: number
    form?: string | null
    description?: string | null
  }>
}) {
  return (
    <Card className="bg-[#566c4e]">
      <CardHeader>
        <CardTitle>Live Allsvenskan table</CardTitle>
        <CardDescription>Current standings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>G</TableHead>
              <TableHead>W</TableHead>
              <TableHead>D</TableHead>
              <TableHead>L</TableHead>
              <TableHead>GF</TableHead>
              <TableHead>GA</TableHead>
              <TableHead>GD</TableHead>
              <TableHead>PTS</TableHead>
              <TableHead>Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((row, index) => (
              <TableRow key={`${row.teamId ?? index}-${row.teamName}`}>
                <TableCell>{row.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {row.teamLogo ? (
                      <img alt="" className="h-6 w-6 rounded-full bg-white/5 object-contain" src={row.teamLogo} />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-[#f6eee0]/10" />
                    )}
                    <div>
                      <div className="font-medium text-white">{toDisplayTeamName(row.teamName)}</div>
                      {row.description ? <div className="text-xs text-[#ede2cf]/55">{row.description}</div> : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{row.played}</TableCell>
                <TableCell>{row.won}</TableCell>
                <TableCell>{row.drawn}</TableCell>
                <TableCell>{row.lost}</TableCell>
                <TableCell>{row.goalsFor}</TableCell>
                <TableCell>{row.goalsAgainst}</TableCell>
                <TableCell>{row.goalDifference}</TableCell>
                <TableCell className="font-semibold text-white">{row.points}</TableCell>
                <TableCell>
                  <span className="text-xs text-[#ede2cf]/80">{row.form ?? '-'}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 bg-[#d9cfbc]" />
        ))}
      </div>
      <Skeleton className="h-[520px] bg-[#d9cfbc]" />
      <Skeleton className="h-[380px] bg-[#d9cfbc]" />
    </div>
  )
}
