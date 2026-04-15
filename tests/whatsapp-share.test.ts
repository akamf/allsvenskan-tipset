import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildRandomWhatsAppRoundSummary,
  buildWhatsAppRoundSummary,
  buildWhatsAppShareUrl,
} from '../src/lib/whatsapp-share'

const dashboardData = {
  summary: {
    currentRound: 7,
    leaderName: 'Andreas',
    lastPlaceName: 'Jacob',
  },
  leaderboard: [
    { ranking: 2, participantName: 'Fredrik', totalPoints: 10 },
    { ranking: 1, participantName: 'Andreas', totalPoints: 12 },
    { ranking: 3, participantName: 'Simon', totalPoints: 9 },
    { ranking: 4, participantName: 'Marcus', totalPoints: 8 },
    { ranking: 5, participantName: 'Jacob', totalPoints: 6 },
  ],
  beerDebtTable: [
    { ranking: 1, participantName: 'Andreas', beerDebt: 0 },
    { ranking: 2, participantName: 'Fredrik', beerDebt: 1 },
    { ranking: 3, participantName: 'Simon', beerDebt: 2 },
    { ranking: 4, participantName: 'Marcus', beerDebt: 3 },
    { ranking: 5, participantName: 'Jacob', beerDebt: 4 },
  ],
} as const

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('whatsapp share helpers', () => {
  it('builds a single flowing paragraph with rivalry tone and safe emoji rendering', () => {
    const message = buildWhatsAppRoundSummary(dashboardData, 0)

    expect(message).toContain('Vi är i omgång 7 av Allsvenskan Tipset')
    expect(message).toContain('Andreas')
    expect(message).toContain('Jacob')
    expect(message).toMatch(/👑|🏆/)
    expect(message).toMatch(/❄️🍺|🍺❄️/)
    expect(message).toContain('Ölrundorna just nu är Andreas 0 ölrundor')
    expect(message).not.toContain('\n')
    expect(message).not.toContain('Skytteliga')
  })

  it('picks templates in a shuffled order without repeating immediately', () => {
    const storage = new Map<string, string>()
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
    })

    const first = buildRandomWhatsAppRoundSummary(dashboardData, () => 0.1)
    const second = buildRandomWhatsAppRoundSummary(dashboardData, () => 0.9)

    expect(first).not.toBe(second)
    expect(storage.get('allsvenskan-tipset:whatsapp-template-queue')).not.toBeNull()
  })

  it('builds a safe WhatsApp share url', () => {
    const message = 'Allsvenskan Tipset - omgång 7 👑'
    expect(buildWhatsAppShareUrl(message)).toBe(`whatsapp://send?text=${encodeURIComponent(message)}`)
  })
})
