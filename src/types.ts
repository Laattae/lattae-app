export type CauseType =
  | 'earnings'
  | 'contract'
  | 'offering'
  | 'policy'
  | 'theme'
  | 'market'
  | 'unknown'

export type MoveScope = 'market' | 'theme' | 'stock'

export interface Stock {
  code: string
  name: string
  aliases: string[]
  keywords: string[]
  sector: string
}

export interface Quote {
  code: string
  close: number
  changePct: number
  history: number[]
}

export interface Holding {
  code: string
  weight: number
}

export interface Portfolio {
  holdings: Holding[]
  keywords: string[]
  notificationsEnabled: boolean
}

export interface Source {
  id: string
  title: string
  publisher: string
  publishedAt: string
  url: string
}

export interface Move {
  id: string
  code: string
  reelId: string
  changePct: number
  close: number
  scope: MoveScope | null
  causeType: CauseType
  summary: string | null
  sources: Source[]
  relatedCodes: string[]
  asOfLabel: string
}

export interface MoveView extends Move {
  name: string
  weight: number | null
  related: { code: string; name: string; changePct: number; moveId: string | null }[]
  vote: 'up' | 'down' | null
}

export interface Tile {
  code: string
  name: string
  changePct: number
  close: number
  weight: number | null
  interest: boolean
}

export interface CatalogHit {
  code: string
  name: string
  changePct: number
  close: number
  moveId: string | null
}

export type ReelCardType = 'move' | 'filing' | 'related' | 'term' | 'article'

export interface ReelCard {
  id: string
  type: ReelCardType
  kicker: string
  title: string
  lines: string[]
  article?: {
    title: string
    publisher: string
    publishedAt: string
    url: string
  }
  related?: { name: string; changePct: number; history: number[] }[]
  liked: boolean
  saved: boolean
}

export interface Reel {
  id: string
  title: string
  moveId: string
  cards: ReelCard[]
}

export interface AlertItem {
  id: string
  moveId: string
  code: string
  name: string
  receivedAt: string
  updatedAt: string | null
  status: 'unknown' | 'confirmed'
  earlierStatus: 'unknown' | null
  text: string
}

export type ReelEvent =
  | { type: 'like'; cardId: string; on: boolean }
  | { type: 'save'; cardId: string; on: boolean }
  | { type: 'skip'; cardId: string }
  | { type: 'view'; cardId: string; ms: number }
