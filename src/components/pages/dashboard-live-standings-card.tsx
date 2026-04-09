import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toDisplayTeamName } from '@/lib/team-display'

type LiveStandingsRow = {
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
}

type DashboardLiveStandingsCardProps = {
  standings: LiveStandingsRow[]
}

export function DashboardLiveStandingsCard({ standings }: DashboardLiveStandingsCardProps) {
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
                <TableCell className="w-8">{row.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    {row.teamLogo ? (
                      <img
                        alt=""
                        className="h-6 w-6 rounded-full bg-white/5 object-contain"
                        src={row.teamLogo}
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-[#f6eee0]/10" />
                    )}
                    <div>
                      <div className="font-medium leading-tight text-white">{toDisplayTeamName(row.teamName)}</div>
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
