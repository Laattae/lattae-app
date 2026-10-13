import type { AlertItem, CatalogHit, MoveView, Portfolio, Reel, ReelCard, ReelEvent, Stock, Tile } from '@/types'
import { extraExplore, extraReels } from './explore'
import { alerts, KEYWORDS, moves, quotes, reels, stocks } from './fixtures'

export interface ExploreEntry {
  id: string
  code: string
  name: string
  aliases: string[]
  reelId: string
  changePct: number
  summary: string | null
  reel: Reel
}

const STORAGE_KEY = 'lattae-portfolio'
const votes = new Map<string, 'up' | 'down'>()
const reelLog: ReelEvent[] = []

function stockByCode(code: string): Stock | undefined {
  return stocks.find((stock) => stock.code === code)
}

function quoteByCode(code: string) {
  return quotes.find((quote) => quote.code === code)
}

function moveByCode(code: string) {
  return moves.find((move) => move.code === code)
}

function relevantCodes(portfolio: Portfolio): Set<string> {
  const codes = new Set(portfolio.holdings.map((holding) => holding.code))
  for (const stock of stocks) {
    if (stock.keywords.some((keyword) => portfolio.keywords.includes(keyword))) {
      codes.add(stock.code)
    }
  }
  return codes
}

function weightOf(portfolio: Portfolio, code: string): number | null {
  return portfolio.holdings.find((holding) => holding.code === code)?.weight ?? null
}

function toView(moveId: string, portfolio: Portfolio): MoveView | null {
  const move = moves.find((item) => item.id === moveId)
  const stock = move ? stockByCode(move.code) : undefined
  if (!move || !stock) return null
  return {
    ...move,
    name: stock.name,
    weight: weightOf(portfolio, move.code),
    vote: votes.get(move.id) ?? null,
    related: move.relatedCodes.flatMap((code) => {
      const relatedStock = stockByCode(code)
      const quote = quoteByCode(code)
      if (!relatedStock || !quote) return []
      return [
        {
          code,
          name: relatedStock.name,
          changePct: quote.changePct,
          moveId: moveByCode(code)?.id ?? null,
        },
      ]
    }),
  }
}

export function listKeywords(): string[] {
  return [...KEYWORDS]
}

function toHit(stock: Stock): CatalogHit | null {
  const quote = quoteByCode(stock.code)
  if (!quote) return null
  return {
    code: stock.code,
    name: stock.name,
    changePct: quote.changePct,
    close: quote.close,
    moveId: moveByCode(stock.code)?.id ?? null,
  }
}

export async function searchCatalog(query: string): Promise<CatalogHit[]> {
  const list = query.trim() ? await searchStocks(query) : stocks
  return list.flatMap((stock) => {
    const hit = toHit(stock)
    return hit ? [hit] : []
  })
}

export async function searchStocks(query: string): Promise<Stock[]> {
  const needle = query.trim().toLowerCase().replace(/\s/g, '')
  if (!needle) return []
  return stocks.filter((stock) =>
    [stock.name, stock.code, stock.sector, ...stock.aliases].some((value) =>
      value.toLowerCase().replace(/\s/g, '').includes(needle),
    ),
  )
}

export async function getPortfolio(): Promise<Portfolio | null> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Portfolio
    if (!Array.isArray(parsed.holdings)) return null
    return parsed
  } catch {
    return null
  }
}

export async function savePortfolio(portfolio: Portfolio): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio))
}

export const demoPortfolio: Portfolio = {
  holdings: [
    { code: '005930', weight: 25 },
    { code: '000660', weight: 15 },
    { code: '035420', weight: 10 },
    { code: '035720', weight: 10 },
    { code: '012450', weight: 10 },
    { code: '005380', weight: 10 },
    { code: '373220', weight: 10 },
    { code: '068270', weight: 10 },
  ],
  keywords: ['반도체', '방산', '플랫폼', '바이오'],
  notificationsEnabled: false,
}

export async function getMoves(portfolio: Portfolio): Promise<MoveView[]> {
  const codes = relevantCodes(portfolio)
  return moves
    .filter((move) => codes.has(move.code))
    .flatMap((move) => {
      const view = toView(move.id, portfolio)
      return view ? [view] : []
    })
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
}

export async function getMoveDetail(id: string): Promise<MoveView | null> {
  const portfolio = await getPortfolio()
  return toView(id, portfolio ?? { holdings: [], keywords: [], notificationsEnabled: false })
}

export async function getWatchGrid(portfolio: Portfolio): Promise<Tile[]> {
  const codes = relevantCodes(portfolio)
  const sharp = new Set(moves.map((move) => move.code))
  return [...codes]
    .filter((code) => !sharp.has(code))
    .flatMap((code) => {
      const stock = stockByCode(code)
      const quote = quoteByCode(code)
      if (!stock || !quote) return []
      const weight = weightOf(portfolio, code)
      return [
        {
          code,
          name: stock.name,
          changePct: quote.changePct,
          close: quote.close,
          weight,
          interest: weight === null,
        },
      ]
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}

function copyReel(reel: Reel): Reel {
  return { ...reel, cards: reel.cards.map((card) => ({ ...card })) }
}

export async function listExplore(query: string): Promise<ExploreEntry[]> {
  const portfolio = await getPortfolio()
  const primary = portfolio ? await getMoves(portfolio) : []
  const stockAliases = new Map(stocks.map((stock) => [stock.code, stock.aliases]))
  const head: ExploreEntry[] = primary.flatMap((move) => {
    const reel = reels.find((item) => item.id === move.reelId)
    if (!reel) return []
    return [
      {
        id: move.id,
        code: move.code,
        name: move.name,
        aliases: stockAliases.get(move.code) ?? [],
        reelId: move.reelId,
        changePct: move.changePct,
        summary: move.summary,
        reel: copyReel(reel),
      },
    ]
  })
  const tail: ExploreEntry[] = extraExplore.map((item) => ({
    id: item.move.id,
    code: item.move.code,
    name: item.name,
    aliases: item.aliases,
    reelId: item.reel.id,
    changePct: item.move.changePct,
    summary: item.move.summary,
    reel: copyReel(item.reel),
  }))
  const needle = query.trim().toLowerCase().replace(/\s/g, '')
  const rows = [...head, ...tail]
  if (!needle) return rows
  return rows.filter((row) =>
    [row.name, row.code, ...row.aliases].some((value) => value.toLowerCase().replace(/\s/g, '').includes(needle)),
  )
}

export async function getReels(reelId?: string): Promise<Reel[]> {
  const index = reelId ? reels.findIndex((reel) => reel.id === reelId) : 0
  const start = index < 0 ? 0 : index
  return [...reels.slice(start), ...reels.slice(0, start)].map((reel) => ({
    ...reel,
    cards: reel.cards.map((card) => ({ ...card })),
  }))
}

export async function postFeedback(moveId: string, vote: 'up' | 'down'): Promise<void> {
  votes.set(moveId, vote)
}

export async function postReelEvent(event: ReelEvent): Promise<void> {
  reelLog.push(event)
  const card = findCard(event.cardId)
  if (!card) return
  if (event.type === 'like') card.liked = event.on
  if (event.type === 'save') card.saved = event.on
}

export async function getAlerts(): Promise<AlertItem[]> {
  return [...alerts].sort((a, b) => {
    const aTime = a.updatedAt ?? a.receivedAt
    const bTime = b.updatedAt ?? b.receivedAt
    return bTime.localeCompare(aTime)
  })
}

function findCard(cardId: string): ReelCard | undefined {
  for (const reel of [...reels, ...extraReels]) {
    const card = reel.cards.find((item) => item.id === cardId)
    if (card) return card
  }
  return undefined
}
