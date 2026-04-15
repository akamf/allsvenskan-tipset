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

const TEMPLATE_STORAGE_KEY = 'allsvenskan-tipset:whatsapp-template-index'
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

const EMOJI = {
  crown: String.fromCodePoint(0x1f451),
  beer: String.fromCodePoint(0x1f37a),
  trophy: String.fromCodePoint(0x1f3c6),
  snowflake: `${String.fromCodePoint(0x2744)}\u{fe0f}`,
  soccer: String.fromCodePoint(0x26bd),
}

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
    roundLabel: summary.currentRound != null ? `omgång ${summary.currentRound}` : 'senaste omgången',
    leaderName: leader?.participantName ?? summary.leaderName ?? 'Ledaren',
    loserName: loser?.participantName ?? summary.lastPlaceName ?? 'Jumbon',
    middleNames,
    beerDebtSentence: beerDebtTable.length > 0 ? buildBeerDebtSentence(beerDebtTable) : 'ingen har behövt bära några ölrundor än',
  }
}

function getStorage() {
  const storage = (globalThis as typeof globalThis & { localStorage?: StorageLike }).localStorage
  return storage ?? null
}

function buildTemplateOne(context: ShareContext) {
  const middleClause = context.middleNames ? ` med ${context.middleNames} i hasorna` : ''

  return `${context.roundLabel} i Allsvenskan Tipset. ${context.leaderName} får sola i toppen ${EMOJI.crown}${middleClause}, medan ${context.loserName} får kyla ölrundorna ${EMOJI.snowflake}${EMOJI.beer}. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

function buildTemplateTwo(context: ShareContext) {
  const middleClause = context.middleNames ? `, ${context.middleNames} ligger och lurar i klungan` : ''

  return `${context.roundLabel} i Allsvenskan Tipset. ${context.leaderName} får njuta av förstaplatsen ${EMOJI.trophy}${middleClause}, och ${context.loserName} får se till att ölrundorna blir kalla och många ${EMOJI.snowflake}${EMOJI.beer}. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

function buildTemplateThree(context: ShareContext) {
  const middleClause = context.middleNames ? `, ${context.middleNames} försöker hålla tempot` : ''

  return `${context.roundLabel} i Allsvenskan Tipset. ${context.leaderName} får stå högst upp och le ${EMOJI.crown}${middleClause}, medan ${context.loserName} får ta sista platsen och kyl ölrundorna på riktigt ${EMOJI.beer}${EMOJI.snowflake}. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

function buildTemplateFour(context: ShareContext) {
  const middleClause = context.middleNames ? `, ${context.middleNames} blandar sig i striden` : ''

  return `${context.roundLabel} i Allsvenskan Tipset. ${context.leaderName} får glida fram som en kung på is ${EMOJI.soccer}${EMOJI.trophy}${middleClause}, och ${context.loserName} får stå för efterfesten genom att kyla ölrundorna ${EMOJI.snowflake}${EMOJI.beer}. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

function buildTemplateFive(context: ShareContext) {
  const middleClause = context.middleNames ? `, ${context.middleNames} tuggar på i mitten` : ''

  return `${context.roundLabel} i Allsvenskan Tipset. ${context.leaderName} får sitta bekvämt i topp ${EMOJI.crown}${middleClause}, medan ${context.loserName} får ta sista tåget hem och bära ölrundorna ${EMOJI.beer}. Ölrundorna just nu är ${context.beerDebtSentence}.`
}

const templates = [
  buildTemplateOne,
  buildTemplateTwo,
  buildTemplateThree,
  buildTemplateFour,
  buildTemplateFive,
] as const

function readTemplateIndex() {
  try {
    const storage = getStorage()

    if (!storage) {
      return 0
    }

    const raw = storage.getItem(TEMPLATE_STORAGE_KEY)
    const parsed = raw == null ? 0 : Number.parseInt(raw, 10)

    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0
    }

    return parsed % templates.length
  } catch {
    return 0
  }
}

function writeNextTemplateIndex(currentIndex: number) {
  const storage = getStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(TEMPLATE_STORAGE_KEY, String((currentIndex + 1) % templates.length))
  } catch {
    // Ignore storage failures and fall back to the first template next time.
  }
}

export function buildWhatsAppRoundSummary(data: SummaryData, templateIndex = 0) {
  const context = buildShareContext(data)
  const template = templates[templateIndex % templates.length]
  return template(context).replace(/[ \t]+/g, ' ').replace(/\s+([,\.])/g, '$1').trim()
}

export function buildRotatingWhatsAppRoundSummary(data: SummaryData) {
  const templateIndex = readTemplateIndex()
  const message = buildWhatsAppRoundSummary(data, templateIndex)
  writeNextTemplateIndex(templateIndex)
  return message
}

export function buildWhatsAppShareUrl(message: string) {
  return `whatsapp://send?text=${encodeURIComponent(message)}`
}
