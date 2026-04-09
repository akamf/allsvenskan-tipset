import { Award, Beer, Trophy } from 'lucide-react'
import { RulesCard } from '@/components/pages/rules-card'

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
      <section className="grid gap-5">
        <RulesCard
          icon={Trophy}
          title="Scoring"
          description="Points for exact hits, near misses, and the bonus rules used in the app."
          items={scoringRules}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <RulesCard
          icon={Award}
          title="Top scorer tiebreak"
          description="Used whenever two participants have the same total points."
          bullets={tiebreakRules}
        />
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
