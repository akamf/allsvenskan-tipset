import type React from 'react'
import { Award, Beer, Trophy, Diamond } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const scoringRules = [
  { label: 'Exact position', value: '+3 points', detail: 'When a team lands exactly where you predicted.' },
  { label: '1 position off', value: '+1 point', detail: 'A near miss still gets rewarded.' },
  { label: '2-4 positions off', value: '0 points', detail: 'No gain, no penalty.' },
  { label: 'Champion bonus', value: '+5 points', detail: 'If your predicted winner is also the actual champion.' },
  { label: 'Relegation bonus', value: '+2 points each', detail: 'For every correctly predicted relegated team.' },
]

const tiebreakRules = [
  'Predicted top scorer is used as the tiebreak.',
  'Exact match is best.',
  'Otherwise the player’s live scorer rank is used.',
  'Lower live rank numbers are better in the tiebreak.',
]

const beerRules = [
  'Rank 1 owes 0 beer rounds.',
  'Rank 2 owes 1 beer round.',
  'Rank 3 owes 2 beer rounds.',
  'Rank 4 owes 3 beer rounds.',
  'Rank 5 owes 4 beer rounds.',
]

export function RulesPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-2">
        <RulesCard
          icon={Trophy}
          title="Scoring"
          description="Points for exact hits, near misses, and the bonus rules used in the app."
          items={scoringRules}
        />

        <RulesCard
          icon={Award}
          title="Top scorer tiebreak"
          description="Used whenever two participants have the same total points."
          bullets={tiebreakRules}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <RulesCard
          icon={Beer}
          title="Beer debt"
          description="Beer rounds are derived from the final ranking."
          bullets={beerRules}
        />
      </section>
    </div>
  )
}

function RulesCard({
  icon: Icon,
  title,
  description,
  items,
  bullets,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  items?: Array<{ label: string; value: string; detail: string }>
  bullets?: string[]
}) {
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
          items.map(item => (
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
            {bullets?.map(bullet => (
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
