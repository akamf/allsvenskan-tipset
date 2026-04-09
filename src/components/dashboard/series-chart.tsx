import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const chartColors = ['#e7dfd2', '#d5b287', '#c6d8bc', '#f0c9a4', '#b98f69']

export function SeriesChart({
  title,
  description,
  data,
  invertYAxis = false,
}: {
  title: string
  description: string
  data: Array<Record<string, string | number>>
  invertYAxis?: boolean
}) {
  const keys = Array.from(
    data.reduce((accumulator, point) => {
      Object.keys(point)
        .filter((key) => key !== 'round' && key !== 'capturedAt')
        .forEach((key) => accumulator.add(key))
      return accumulator
    }, new Set<string>()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[260px] pt-2 sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <XAxis dataKey="round" stroke="#eadfce" tickLine={false} axisLine={false} />
            <YAxis
              stroke="#eadfce"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              reversed={invertYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#4f6748',
                border: '1px solid rgba(239, 231, 216, 0.18)',
                borderRadius: 16,
                color: '#f5eee2',
              }}
            />
            <Legend />
            {keys.map((key, index) => (
              <Line
                key={key}
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                type="monotone"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
