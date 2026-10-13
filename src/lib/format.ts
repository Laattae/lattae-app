import type { CauseType, MoveScope } from '@/types'

export function formatPrice(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}

export function formatPct(value: number): string {
  const abs = Math.abs(value).toFixed(1)
  if (value > 0) return `+${abs}%`
  if (value < 0) return `-${abs}%`
  return '0.0%'
}

export function changeDirection(value: number): 'up' | 'down' | 'flat' {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}

export function spokenChange(value: number): string {
  const abs = Math.abs(value).toFixed(1)
  if (value > 0) return `상승 ${abs}%`
  if (value < 0) return `하락 ${abs}%`
  return '보합 0.0%'
}

export function causeLabel(cause: CauseType): string {
  const labels: Record<CauseType, string> = {
    earnings: '실적',
    contract: '공급계약',
    offering: '증자',
    policy: '정책',
    theme: '테마',
    market: '시장 전체',
    unknown: '원인 미확인',
  }
  return labels[cause]
}

export function scopeLabel(scope: MoveScope): string {
  const labels: Record<MoveScope, string> = {
    market: '시장 전체',
    theme: '테마 동반',
    stock: '종목 고유',
  }
  return labels[scope]
}

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Seoul',
  }).format(new Date(iso))
}

export const UNKNOWN_LINE = '확인된 공시·뉴스 없음 · 원인 미확인'
