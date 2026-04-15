import type { DashboardResponse } from '@/lib/types'

type SummaryData = {
  summary?: Partial<DashboardResponse['summary']> | null
  leaderboard?: ReadonlyArray<Pick<DashboardResponse['leaderboard'][number], 'ranking' | 'participantName' | 'totalPoints'>> | null
  beerDebtTable?: ReadonlyArray<Pick<DashboardResponse['beerDebtTable'][number], 'ranking' | 'participantName' | 'beerDebt'>> | null
}

type ShareContext = {
  roundLabel: string
  leaderName: string
  loserName: string
  middleNames: string
  beerDebtSentence: string
}

const TEMPLATE_QUEUE_STORAGE_KEY = 'allsvenskan-tipset:whatsapp-template-queue'
const EMOJI = {
  crown: String.fromCodePoint(0x1f451),
  beer: String.fromCodePoint(0x1f37a),
  trophy: String.fromCodePoint(0x1f3c6),
  snowflake: `${String.fromCodePoint(0x2744)}\u{fe0f}`,
  soccer: String.fromCodePoint(0x26bd),
}
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

function joinSwedishNames(names: string[]) {
  if (names.length === 0) {
    return ''
  }

  if (names.length === 1) {
    return names[0]
  }

  if (names.length === 2) {
    return `${names[0]} och ${names[1]}`
  }

  return `${names.slice(0, -1).join(', ')} och ${names.at(-1)}`
}

function formatBeerDebt(amount: number) {
  return `${amount} ölrundor`
}

function buildBeerDebtSentence(leaderboard: Array<Pick<DashboardResponse['beerDebtTable'][number], 'ranking' | 'participantName' | 'beerDebt'>>) {
  return leaderboard.map((row) => `${row.participantName} ${formatBeerDebt(row.beerDebt)}`).join(', ')
}

function buildShareContext(data: SummaryData): ShareContext {
  const summary = data.summary ?? {}
  const leaderboard = [...(data.leaderboard ?? [])].sort((a, b) => a.ranking - b.ranking)
  const beerDebtTable = [...(data.beerDebtTable ?? [])].sort((a, b) => a.ranking - b.ranking)
  const leader = leaderboard[0]
  const loser = leaderboard.at(-1)
  const middleNames = joinSwedishNames(leaderboard.slice(1, -1).map((row) => row.participantName))

  return {
    roundLabel: summary.currentRound != null ? `Vi är i omgång ${summary.currentRound} av Allsvenskan Tipset` : 'Vi är i senaste omgången av Allsvenskan Tipset',
    leaderName: leader?.participantName ?? summary.leaderName ?? 'Ledaren',
    loserName: loser?.participantName ?? summary.lastPlaceName ?? 'Jumbon',
    middleNames,
    beerDebtSentence: beerDebtTable.length > 0 ? buildBeerDebtSentence(beerDebtTable) : 'ingen har behövt bära några ölrundor än',
  }
}

function getSessionStorage() {
  const storage = (globalThis as typeof globalThis & { sessionStorage?: StorageLike }).sessionStorage
  return storage ?? null
}

function buildTemplateOne(context: ShareContext) {
  const middleClause = context.middleNames ? `, medan ${context.middleNames} jagar bakom` : ''

  return `${context.roundLabel} och ${context.leaderName} sitter bekvämt på tronen ${EMOJI.crown}${middleClause}. Längst ner får ${context.loserName} bära kvällens kalla skam och kyla ölrundorna ${EMOJI.snowflake}${EMOJI.beer}. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

function buildTemplateTwo(context: ShareContext) {
  const middleClause = context.middleNames ? `, med ${context.middleNames} som klamrar sig fast i jakten` : ''

  return `${context.roundLabel}. ${context.leaderName} får njuta av förstaplatsen ${EMOJI.trophy}${middleClause}, medan ${context.loserName} får stå för isfronten och se till att ölrundorna blir både kalla och många ${EMOJI.snowflake}${EMOJI.beer}. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

function buildTemplateThree(context: ShareContext) {
  const middleClause = context.middleNames ? `, där ${context.middleNames} försöker hänga med` : ''

  return `${context.roundLabel}. ${context.leaderName} får spela kung ${EMOJI.crown} ${EMOJI.trophy}${middleClause}, och ${context.loserName} får ta hand om baksmällans logistik genom att kyla ölrundorna ${EMOJI.snowflake}${EMOJI.beer}. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

function buildTemplateFour(context: ShareContext) {
  const middleClause = context.middleNames ? `, och ${context.middleNames} står och sniffar på guldet` : ''

  return `${context.roundLabel}. ${context.leaderName} får glänsa i topp och ta emot jublet ${EMOJI.trophy}${middleClause}. ${context.loserName} får däremot hålla sig varm genom att servera kalla ölrundor ${EMOJI.snowflake}${EMOJI.beer} till resten av gänget. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

function buildTemplateFive(context: ShareContext) {
  const middleClause = context.middleNames ? `, medan ${context.middleNames} försöker bryta sig loss` : ''

  return `${context.roundLabel}. ${context.leaderName} får dansa längst fram i tåget ${EMOJI.crown}${middleClause}. ${context.loserName} får gå sist och se till att ölrundorna blir iskalla och levererade på rätt nivå ${EMOJI.snowflake}${EMOJI.beer}. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

const templates = [
  buildTemplateOne,
  buildTemplateTwo,
  buildTemplateThree,
  buildTemplateFour,
  buildTemplateFive,
] as const

export function buildWhatsAppRoundSummary(data: SummaryData, templateIndex = 0) {
  const context = buildShareContext(data)
  const template = templates[templateIndex % templates.length]
  return template(context).replace(/[ \t]+/g, ' ').replace(/\s+([,\.])/g, '$1').trim()
}

export function buildRandomWhatsAppRoundSummary(data: SummaryData, random: () => number = Math.random) {
  const storage = getSessionStorage()
  const templateIndex = (() => {
    if (!storage) {
      return Math.floor(random() * templates.length) % templates.length
    }

    const rawQueue = storage.getItem(TEMPLATE_QUEUE_STORAGE_KEY)
    const queue = rawQueue
      ? rawQueue
          .split(',')
          .map((value) => Number.parseInt(value, 10))
          .filter((value) => Number.isInteger(value) && value >= 0 && value < templates.length)
      : []

    const nextQueue = queue.length > 0 ? queue : shuffleTemplateOrder(random)
    const [nextIndex, ...rest] = nextQueue
    storage.setItem(TEMPLATE_QUEUE_STORAGE_KEY, rest.join(','))
    return nextIndex ?? 0
  })()

  const message = buildWhatsAppRoundSummary(data, templateIndex)
  return message
}

function shuffleTemplateOrder(random: () => number) {
  const order = templates.map((_, index) => index)

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const temp = order[i]
    order[i] = order[j] ?? order[i]
    order[j] = temp
  }

  return order
}

export function buildWhatsAppShareUrl(message: string) {
  return `whatsapp://send?text=${encodeURIComponent(message)}`
}
