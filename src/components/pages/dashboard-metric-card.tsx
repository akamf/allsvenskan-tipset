import type { ComponentType } from 'react'
import { Card, CardContent } from '@/components/ui/card'

type DashboardMetricCardProps = {
  label: string
  value: string
  hint: string
  icon: ComponentType<{ className?: string }>
}

export function DashboardMetricCard({ label, value, hint, icon: Icon }: DashboardMetricCardProps) {
  return (
    <Card className="bg-[#607656]">
      <CardContent className="flex min-h-[104px] items-center justify-start gap-4 px-5 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f6eee0]/10">
          <Icon className="h-5 w-5 text-[#f1e5d3]" />
        </div>
        <div className="flex min-w-0 flex-col justify-center text-left">
          <p className="text-sm text-[#efe6d8]/70">{label}</p>
          <p className="font-display text-xl font-semibold text-white">{value}</p>
          <p className="text-xs text-[#efe6d8]/50">{hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}
