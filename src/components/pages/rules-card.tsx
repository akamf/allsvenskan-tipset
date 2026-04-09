import type { ComponentType } from 'react'
import { Diamond } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type RulesItem = {
  label: string
  value: string
  detail: string
}

type RulesCardProps = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  items?: RulesItem[]
  bullets?: string[]
}

export function RulesCard({ icon: Icon, title, description, items, bullets }: RulesCardProps) {
  return (
    <Card className="bg-[#607656]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5ecde]/10 text-[#f5ecde]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items ? (
          items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#f1e1c7]/10 bg-[#f5ecde]/5 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-[#f6efe2]">{item.label}</p>
                <p className="font-display text-lg text-[#f6efe2]">{item.value}</p>
              </div>
              <p className="mt-1 text-sm text-[#ece0cd]/75">{item.detail}</p>
            </div>
          ))
        ) : (
          <ul className="space-y-2">
            {bullets?.map((bullet) => (
              <li
                key={bullet}
                className="rounded-2xl px-4 py-3 text-sm text-[#f2e7d6]/85"
              >
                <div className="flex items-start gap-3">
                  <Diamond className="mt-0.5 h-4 w-4 shrink-0 text-[#e7d7bf]" />
                  <span>{bullet}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
