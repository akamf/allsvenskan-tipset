import { describe, expect, it } from 'vitest'
import { normalizeTeamName } from '../server/normalization/teams'

describe('normalizeTeamName', () => {
  it('maps common external variants to canonical names', () => {
    expect(normalizeTeamName('Malmo FF')).toBe('Malmö FF')
    expect(normalizeTeamName('IFK Goteborg')).toBe('IFK Göteborg')
    expect(normalizeTeamName('BP')).toBe('Brommapojkarna')
  })

  it('fails clearly for unknown team names', () => {
    expect(() => normalizeTeamName('Unknown United')).toThrow(/Unrecognized team name/)
  })
})
