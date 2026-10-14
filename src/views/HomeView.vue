<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAlerts, getMoveDetail, getMoves, getPortfolio } from '@/api/lattae'
import type { AlertItem, MoveView } from '@/types'

interface Notice {
  id: string
  name: string
  moveId: string
  reelId: string
  chip: string
  tone: 'up' | 'down' | 'pending' | 'confirmed'
  time: string
  earlier: string | null
  title: string
  body: string | null
  sources: number
}

const held = ref(0)
const keywords = ref(0)
const sharp = ref(0)
const confirmed = ref(0)
const pending = ref(0)
const refreshed = ref('')
const notices = ref<Notice[]>([])
const ready = ref(false)
const failed = ref(false)

function clock(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Seoul',
  }).format(new Date(iso))
}

function chipOf(move: MoveView, alert: AlertItem): Pick<Notice, 'chip' | 'tone'> {
  if (alert.status === 'unknown' || move.causeType === 'unknown') {
    return { chip: '확인 중', tone: 'pending' }
  }
  if (move.causeType === 'theme' || move.causeType === 'market') {
    if (move.changePct > 0) return { chip: '상승', tone: 'up' }
    if (move.changePct < 0) return { chip: '하락', tone: 'down' }
    return { chip: '보합', tone: 'confirmed' }
  }
  return { chip: '원인 확인', tone: 'confirmed' }
}

function toNotice(alert: AlertItem, move: MoveView): Notice {
  const summary = move.summary
  return {
    id: alert.id,
    name: alert.name,
    moveId: alert.moveId,
    reelId: move.reelId,
    ...chipOf(move, alert),
    time: clock(alert.updatedAt ?? alert.receivedAt),
    earlier: alert.earlierStatus === 'unknown' ? clock(alert.receivedAt) : null,
    title: alert.text,
    body: summary && summary !== alert.text ? summary : null,
    sources: move.sources.length,
  }
}

async function load() {
  failed.value = false
  try {
    const portfolio = await getPortfolio()
    if (!portfolio) return
    const [alerts, moves] = await Promise.all([getAlerts(), getMoves(portfolio)])
    const ordered = [...alerts].sort(
      (a, b) => Date.parse(b.updatedAt ?? b.receivedAt) - Date.parse(a.updatedAt ?? a.receivedAt),
    )
    const details = await Promise.all(ordered.map((alert) => getMoveDetail(alert.moveId)))
    held.value = portfolio.holdings.length
    keywords.value = portfolio.keywords.length
    sharp.value = moves.length
    confirmed.value = alerts.filter((alert) => alert.status === 'confirmed').length
    pending.value = alerts.filter((alert) => alert.status === 'unknown').length
    const newest = ordered[0]
    refreshed.value = newest ? clock(newest.updatedAt ?? newest.receivedAt) : ''
    notices.value = ordered.flatMap((alert, index) => {
      const move = details[index]
      if (!move || move.changePct <= 0) return []
      return [toNotice(alert, move)]
    })
  } catch {
    failed.value = true
  } finally {
    ready.value = true
  }
}

onMounted(load)
</script>

<template>
  <div class="view home">
    <header class="bar home-bar">
      <div>
        <h1 class="mark">라떼</h1>
        <p class="tagline">Your portfolio, explained.</p>
      </div>
    </header>

    <p v-if="!ready" class="note pad" role="status">불러오는 중</p>
    <p v-else-if="failed" class="note pad" role="alert">
      홈을 불러오지 못했습니다.
      <button type="button" class="text-btn" @click="load">다시 시도</button>
    </p>
    <div v-else class="board">
      <section class="card" aria-labelledby="today-title">
        <header class="card-head">
          <h2 id="today-title">오늘 현황</h2>
          <p v-if="refreshed" class="fresh">{{ refreshed }} 갱신</p>
        </header>
        <dl class="stats">
          <div>
            <dt>종목 보유</dt>
            <dd class="num">{{ held }}</dd>
          </div>
          <div>
            <dt>급변</dt>
            <dd class="num up">{{ sharp }}</dd>
          </div>
          <div>
            <dt>원인 확인</dt>
            <dd class="num down">{{ confirmed }}</dd>
          </div>
          <div>
            <dt>확인 중</dt>
            <dd class="num pending">{{ pending }}</dd>
          </div>
        </dl>
        <p class="watch">
          감시 종목 : <strong>{{ held }} 종목</strong>
          <span aria-hidden="true"> · </span>
          관심 키워드 : <strong>{{ keywords }} 개</strong>
        </p>
      </section>

      <section class="card" aria-labelledby="notice-title">
        <header class="card-head">
          <h2 id="notice-title">급등 알림</h2>
          <p class="count">{{ notices.length }}건</p>
        </header>
        <p v-if="!notices.length" class="note">오늘 급등으로 표시할 종목이 없습니다.</p>
        <article v-for="(notice, index) in notices" :key="notice.id" class="notice in" :style="{ '--i': index }">
          <div class="who">
            <h3>
              <RouterLink :to="`/moves/${notice.moveId}`">{{ notice.name }}</RouterLink>
            </h3>
            <span class="chip" :data-tone="notice.tone">{{ notice.chip }}</span>
            <span class="time">
              <template v-if="notice.earlier">{{ notice.earlier }} 원인 미확인 · </template>
              <time>{{ notice.time }}</time>
            </span>
          </div>
          <p class="title">
            <RouterLink :to="`/moves/${notice.moveId}`">{{ notice.title }}</RouterLink>
          </p>
          <p v-if="notice.body" class="body">{{ notice.body }}</p>
          <div class="foot">
            <RouterLink class="meta" :to="`/moves/${notice.moveId}`">
              {{ notice.sources ? `근거 ${notice.sources}건` : '근거 없음' }}
            </RouterLink>
            <RouterLink class="pill" :to="`/reels/${notice.reelId}?kind=reel`">숏폼 보기</RouterLink>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-bar {
  border-bottom: 1px solid var(--line);
}

.pad { padding: 0 16px; }

.board {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 12px 8px;
}

.card {
  padding: 16px 16px 8px;
  border-radius: 18px;
  background: var(--bg-raised);
  box-shadow: 0 8px 24px rgb(74 44 29 / 8%);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-head h2,
.fresh,
.count,
.watch,
.title,
.body,
.note {
  margin: 0;
}

.card-head h2 {
  font-size: 16px;
}

.fresh,
.watch,
.time,
.meta,
.body {
  color: var(--muted);
  font-size: 12px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 16px 0 12px;
  text-align: center;
}

.stats div {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
}

.stats dt {
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
}

.stats dd {
  margin: 0;
  font-size: 26px;
  font-weight: 750;
  line-height: 1.1;
}

.up { color: var(--up); }
.down { color: var(--down); }
.pending { color: #a86b2a; }

.watch {
  margin-bottom: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
}

.watch strong {
  color: var(--text);
  font-weight: 700;
}

.count {
  min-width: 28px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgb(158 43 43 / 10%);
  color: var(--up);
  font-size: 12px;
  font-weight: 750;
  text-align: center;
}

.notice {
  padding: 14px 0;
}

.notice + .notice {
  border-top: 1px solid var(--line);
}

.who {
  display: flex;
  align-items: center;
  gap: 6px;
}

.who h3 {
  margin: 0;
  font-size: 15px;
}

.who a,
.title a,
.meta {
  color: inherit;
  text-decoration: none;
}

.time {
  margin-left: auto;
  white-space: nowrap;
}

.chip {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 750;
}

.chip[data-tone='up'] {
  background: rgb(158 43 43 / 12%);
  color: var(--up);
}

.chip[data-tone='down'] {
  background: rgb(30 78 140 / 12%);
  color: var(--down);
}

.chip[data-tone='confirmed'] {
  background: rgb(30 78 140 / 12%);
  color: var(--down);
}

.chip[data-tone='pending'] {
  background: rgb(168 107 42 / 14%);
  color: #a86b2a;
}

.title {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.35;
}

.body {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.45;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
}

.pill {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--accent);
  color: #4a2c1d;
  font-size: 13px;
  font-weight: 750;
  line-height: 32px;
  text-decoration: none;
}
</style>
