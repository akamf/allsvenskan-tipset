import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type DashboardDataTableCardProps = {
  title: string
  description: string
  headers: string[]
  rows: Array<Array<string | number>>
}

export function DashboardDataTableCard({ title, description, headers, rows }: DashboardDataTableCardProps) {
  return (
    <Card className="min-w-0 bg-[#5d7454]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="w-max sm:w-full">
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
