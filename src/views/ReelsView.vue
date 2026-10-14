<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listExplore, postReelEvent } from '@/api/lattae'
import BrewMark from '@/components/BrewMark.vue'
import BrewStatus from '@/components/BrewStatus.vue'
import ChangePct from '@/components/ChangePct.vue'
import Icon from '@/components/Icon.vue'
import Sparkline from '@/components/Sparkline.vue'
import { formatWhen } from '@/lib/format'
import type { Reel, ReelCard } from '@/types'

interface FeedItem {
  key: string
  kind: 'post' | 'reel'
  reel: Reel
}

const route = useRoute()
const router = useRouter()
const deck = ref<HTMLElement | null>(null)
const ready = ref(false)
const feed = ref<FeedItem[]>([])
const loop = ref<FeedItem[]>([])
const pageOf = ref<Record<string, number>>({})
const activeKey = ref('')
const activeId = ref('')
const progress = ref(0)
const REEL_MS = 10000
let startedAt = 0
let generation = 0
let appending = false
let clock = 0
let observer: IntersectionObserver | undefined
let endObserver: IntersectionObserver | undefined

function stopClock() {
  cancelAnimationFrame(clock)
  clock = 0
}

function startClock(key: string) {
  stopClock()
  progress.value = 0
  const item = feed.value.find((entry) => entry.key === key)
  if (!item || item.kind !== 'reel') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const origin = performance.now()
  const tick = (now: number) => {
    if (activeKey.value !== key) return
    progress.value = ((now - origin) % REEL_MS) / REEL_MS
    clock = requestAnimationFrame(tick)
  }
  clock = requestAnimationFrame(tick)
}

function pageOfItem(key: string) {
  return pageOf.value[key] ?? 0
}

function shown(item: FeedItem): ReelCard | undefined {
  return item.reel.cards[pageOfItem(item.key)] ?? item.reel.cards[0]
}

function stamp(items: FeedItem[]): FeedItem[] {
  const gen = generation
  generation += 1
  return items.map((item) => ({ ...item, key: `${item.kind}-${item.reel.id}-${gen}` }))
}

function lead(reel: Reel): ReelCard | undefined {
  return reel.cards[0]
}

function leave(cardId: string) {
  if (!cardId || !startedAt) return
  const ms = Math.round(performance.now() - startedAt)
  startedAt = 0
  if (ms < 800) void postReelEvent({ type: 'skip', cardId })
  else void postReelEvent({ type: 'view', cardId, ms })
}

function enter(cardId: string) {
  if (!cardId || cardId === activeId.value) return
  leave(activeId.value)
  activeId.value = cardId
  startedAt = performance.now()
}

function enterItem(key: string) {
  const item = feed.value.find((entry) => entry.key === key)
  if (!item) return
  activeKey.value = key
  const card = item.kind === 'reel' ? lead(item.reel) : shown(item)
  if (card) enter(card.id)
  startClock(key)
}

function bind(initial = false) {
  observer?.disconnect()
  const root = deck.value
  if (!root) return
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      const key = visible?.target.getAttribute('data-key')
      if (key) enterItem(key)
    },
    { root, threshold: [0.6, 0.85] },
  )
  root.querySelectorAll('[data-key]').forEach((node) => observer?.observe(node))
  if (initial) {
    const firstKey = root.querySelector('[data-key]')?.getAttribute('data-key')
    if (firstKey) enterItem(firstKey)
  }
  observeEnd()
}

function observeEnd() {
  endObserver?.disconnect()
  const root = deck.value
  const nodes = root?.querySelectorAll('[data-key]')
  const last = nodes?.item(nodes.length - 1)
  if (!root || !last) return
  endObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void append()
    },
    { root, rootMargin: '100% 0px' },
  )
  endObserver.observe(last)
}

async function append() {
  if (appending || loop.value.length === 0 || feed.value.length >= loop.value.length * 12) return
  appending = true
  endObserver?.disconnect()
  feed.value = [...feed.value, ...stamp(loop.value)]
  await nextTick()
  bind()
  appending = false
}

function paceOf(type: ReelCard['type']) {
  return type === 'move' ? 'espresso' : 'roast'
}

async function load() {
  ready.value = false
  leave(activeId.value)
  activeId.value = ''
  activeKey.value = ''
  pageOf.value = {}
  progress.value = 0
  generation = 0
  appending = false
  stopClock()
  const reelId = typeof route.params.reelId === 'string' ? route.params.reelId : undefined
  const kind = route.query.kind === 'reel' ? 'reel' : 'post'
  const rows = await listExplore('')
  const items: FeedItem[] = rows.flatMap((row) => [
    { key: `post-${row.reel.id}`, kind: 'post', reel: row.reel },
    { key: `reel-${row.reel.id}`, kind: 'reel', reel: row.reel },
  ])
  const start = items.findIndex((item) => item.reel.id === reelId && item.kind === kind)
  loop.value = start > 0 ? [...items.slice(start), ...items.slice(0, start)] : items
  feed.value = stamp(loop.value)
  ready.value = true
  await nextTick()
  deck.value?.scrollTo({ top: 0 })
  deck.value?.querySelectorAll('.carousel').forEach((node) => {
    if (node instanceof HTMLElement) node.scrollTo({ left: 0 })
  })
  bind(true)
}

function motion(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function step(direction: number) {
  const root = deck.value
  if (!root) return
  root.scrollBy({ top: direction * root.clientHeight, behavior: motion() })
}

function carouselOf(reelId: string): HTMLElement | null {
  const node = deck.value?.querySelector(`[data-carousel="${reelId}"]`)
  return node instanceof HTMLElement ? node : null
}

function goPage(key: string, index: number) {
  const item = feed.value.find((entry) => entry.key === key)
  const carousel = carouselOf(key)
  if (!item || !carousel || item.reel.cards.length === 0) return
  const next = Math.min(item.reel.cards.length - 1, Math.max(0, index))
  pageOf.value = { ...pageOf.value, [key]: next }
  const left = next * carousel.clientWidth
  carousel.scrollLeft = left
  void nextTick(() => {
    carousel.scrollLeft = left
  })
  const card = item.reel.cards[next]
  if (card && activeKey.value === key) enter(card.id)
}

function onPageScroll(event: Event, item: FeedItem) {
  const el = event.target
  if (!(el instanceof HTMLElement) || el.clientWidth === 0) return
  const index = Math.min(item.reel.cards.length - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))
  if (index === pageOfItem(item.key)) return
  pageOf.value = { ...pageOf.value, [item.key]: index }
  const card = item.reel.cards[index]
  if (card && activeKey.value === item.key) enter(card.id)
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    step(1)
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    step(-1)
  }
  const item = feed.value.find((entry) => entry.key === activeKey.value)
  if (!item || item.kind !== 'post') return
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    goPage(item.key, pageOfItem(item.key) + 1)
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goPage(item.key, pageOfItem(item.key) - 1)
  }
}

async function toggle(card: ReelCard | undefined, type: 'like' | 'save') {
  if (!card) return
  const on = type === 'like' ? !card.liked : !card.saved
  if (type === 'like') card.liked = on
  else card.saved = on
  await postReelEvent({ type, cardId: card.id, on })
}

watch(
  () => `${String(route.params.reelId ?? '')}:${String(route.query.kind ?? '')}`,
  () => {
    void load()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  leave(activeId.value)
  stopClock()
  observer?.disconnect()
  endObserver?.disconnect()
})
</script>

<template>
  <div class="reel">
    <h1 class="sr-only">오늘의 변동</h1>
    <div v-if="!feed.length" class="wait">
      <BrewStatus v-if="!ready" kind="roast" label="불러오는 중" />
      <template v-else>
        <BrewMark kind="roast" :size="96" />
        <p>표시할 릴스가 없습니다.</p>
      </template>
    </div>
    <div v-else ref="deck" class="deck" tabindex="0" @keydown="onKey">
      <article
        v-for="item in feed"
        :key="item.key"
        class="item"
        :data-kind="item.kind"
        :data-key="item.key"
      >
        <button type="button" class="back icon-btn" aria-label="뒤로" @click="router.back()">
          <Icon name="back" />
        </button>

        <template v-if="item.kind === 'post'">
          <div class="carousel-clip">
          <div
            class="carousel"
            :data-carousel="item.key"
            tabindex="0"
            aria-label="게시글 내용"
            @scroll="onPageScroll($event, item)"
          >
            <section v-for="card in item.reel.cards" :key="card.id" class="page" :data-type="card.type">
              <BrewMark :kind="paceOf(card.type)" :size="72" />
              <p class="kicker">{{ card.kicker }}</p>
              <h2>{{ card.title }}</h2>
              <ol v-if="card.type === 'filing'">
                <li v-for="line in card.lines" :key="line">{{ line }}</li>
              </ol>
              <template v-else>
                <p v-for="line in card.lines" :key="line">{{ line }}</p>
              </template>
              <ul v-if="card.related?.length" class="related">
                <li v-for="related in card.related" :key="related.name">
                  <span>{{ related.name }}</span>
                  <ChangePct :value="related.changePct" />
                  <Sparkline :values="related.history" />
                  <small>전일 종가 기준 · 최근 5영업일</small>
                </li>
              </ul>
              <p v-if="card.article" class="article">
                <a :href="card.article.url" target="_blank" rel="noopener noreferrer">
                  {{ card.article.title }}
                  <span class="sr-only">(새 탭)</span>
                </a>
                <small>{{ card.article.publisher }} · {{ formatWhen(card.article.publishedAt) }}</small>
              </p>
            </section>
          </div>
          </div>
          <p v-if="item.reel.cards.length > 1" class="counter num">
            {{ pageOfItem(item.key) + 1 }} / {{ item.reel.cards.length }}
          </p>
          <footer class="caption">
            <strong>{{ item.reel.title }}</strong>
            <p>{{ shown(item)?.title }}</p>
            <div v-if="item.reel.cards.length > 1" class="dots" role="tablist" aria-label="게시글 장">
              <button
                v-for="(card, index) in item.reel.cards"
                :key="card.id"
                type="button"
                role="tab"
                :aria-selected="pageOfItem(item.key) === index"
                :aria-label="`${index + 1}장`"
                @click="goPage(item.key, index)"
              />
            </div>
          </footer>
          <div class="rail">
            <button
              type="button"
              class="rail-btn"
              :aria-pressed="shown(item)?.liked === true"
              :aria-label="shown(item)?.liked ? '좋아요 취소' : '좋아요'"
              @click="toggle(shown(item), 'like')"
            >
              <Icon name="heart" :filled="shown(item)?.liked === true" />
            </button>
            <button
              type="button"
              class="rail-btn"
              :aria-pressed="shown(item)?.saved === true"
              :aria-label="shown(item)?.saved ? '저장 취소' : '저장'"
              @click="toggle(shown(item), 'save')"
            >
              <Icon name="bookmark" :filled="shown(item)?.saved === true" />
            </button>
          </div>
        </template>

        <template v-else-if="lead(item.reel)">
          <BrewMark class="wash" kind="roast" tone="dark" motion :size="240" />
          <div class="frame">
            <div class="overlay">
              <p class="kicker">{{ lead(item.reel)?.kicker }}</p>
              <h2>{{ lead(item.reel)?.title }}</h2>
              <p v-for="line in lead(item.reel)?.lines" :key="line">{{ line }}</p>
            </div>
            <footer class="reel-foot">
              <strong>{{ item.reel.title }}</strong>
              <p>릴스</p>
            </footer>
          </div>
          <div class="rail">
            <button
              type="button"
              class="rail-btn"
              :aria-pressed="lead(item.reel)?.liked === true"
              :aria-label="lead(item.reel)?.liked ? '좋아요 취소' : '좋아요'"
              @click="toggle(lead(item.reel), 'like')"
            >
              <Icon name="heart" :filled="lead(item.reel)?.liked === true" />
            </button>
            <button
              type="button"
              class="rail-btn"
              :aria-pressed="lead(item.reel)?.saved === true"
              :aria-label="lead(item.reel)?.saved ? '저장 취소' : '저장'"
              @click="toggle(lead(item.reel), 'save')"
            >
              <Icon name="bookmark" :filled="lead(item.reel)?.saved === true" />
            </button>
          </div>
          <div class="scrub" aria-hidden="true">
            <span :style="{ transform: `scaleX(${item.key === activeKey ? progress : 0})` }"></span>
          </div>
        </template>
      </article>
    </div>
  </div>
</template>

<style scoped>
.reel,
.deck,
.wait {
  height: 100%;
}
.wait {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
}
.wait p { margin: 0; color: var(--muted); font-size: 13px; }
.reel { overflow: hidden; }
.deck {
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  overscroll-behavior: contain;
  touch-action: pan-y;
  background: var(--bg);
  scrollbar-width: none;
}
.deck::-webkit-scrollbar { display: none; }
.item {
  position: relative;
  height: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  overflow: hidden;
}
.scrub {
  position: absolute;
  z-index: 4;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  height: 2px;
  background: rgb(247 235 218 / 32%);
}
.scrub span {
  display: block;
  width: 100%;
  height: 100%;
  background: #f7ebda;
  transform: scaleX(0);
  transform-origin: left center;
}
.item[data-kind='post'] {
  display: flex;
  flex-direction: column;
  background: var(--bg);
}
.back {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  border: 0;
  background: transparent;
  color: inherit;
}
.carousel-clip {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.carousel {
  display: flex;
  height: calc(100% + 20px);
  padding-bottom: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
}
.carousel::-webkit-scrollbar { display: none; width: 0; height: 0; }
.page {
  display: flex;
  flex: 0 0 100%;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 72px 24px 28px;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  overflow: hidden;
  text-align: center;
  touch-action: pan-x;
  background: var(--canvas);
}
.kicker, h2, p, small, strong { margin: 0; }
.page > p,
.page > ol,
.page > .related,
.page > .article { width: 100%; }
.kicker { color: var(--muted); font-weight: 700; }
.page h2 { font-size: 1.45rem; letter-spacing: -0.03em; line-height: 1.3; }
.page ol {
  margin: 0;
  padding: 0;
  list-style-position: inside;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.related { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.page[data-type='related'] .related {
  align-items: flex-start;
  padding-left: 14px;
  border-left: 2px solid var(--accent);
  text-align: left;
}
.page[data-type='related'] .related li { align-items: flex-start; }
.related li, .article { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
.article a { text-decoration: underline; text-underline-offset: 2px; }
small { color: var(--muted); }
.counter {
  position: absolute;
  top: 16px;
  right: 14px;
  z-index: 2;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgb(74 44 29 / 72%);
  color: #f7ebda;
  font-size: 12px;
}
.caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px calc(92px + env(safe-area-inset-bottom));
  background: var(--bg-raised);
  text-align: center;
}
.caption p { color: var(--muted); }
.dots { display: flex; justify-content: center; gap: 5px; margin-top: 6px; }
.dots button {
  width: 6px;
  height: 6px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--line);
  transition: width 0.32s var(--ease-out), background-color 0.22s var(--ease-out);
}
.dots button[aria-selected='true'] { width: 16px; background: var(--accent); }
.rail {
  position: absolute;
  right: 8px;
  bottom: calc(108px + env(safe-area-inset-bottom));
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rail-btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  transition: transform 0.16s var(--ease-press), color 0.2s var(--ease-out);
}
.rail-btn:active { transform: scale(0.88); }
.rail-btn[aria-pressed='true'] {
  color: var(--accent);
  animation: pop 0.42s var(--ease-out);
}
@keyframes pop {
  0% { transform: scale(0.84); }
  46% { transform: scale(1.16); }
  100% { transform: scale(1); }
}
.item[data-kind='reel'] { color: #f7ebda; background: #4a2c1d; }
.wash {
  position: absolute;
  top: 14%;
  left: 50%;
  z-index: 0;
  opacity: 0.38;
  pointer-events: none;
  translate: -50% 0;
}
.frame { position: relative; z-index: 1; }
.frame { height: 100%; }
.overlay {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 72px 24px 96px;
  text-align: center;
}
.item[data-kind='reel'] .kicker { color: #f7ebda; }
.overlay h2 {
  font-size: 1.55rem;
  letter-spacing: -0.03em;
  line-height: 1.35;
  text-shadow: 0 1px 10px rgb(0 0 0 / 28%);
}
.reel-foot {
  position: absolute;
  right: 16px;
  bottom: calc(92px + env(safe-area-inset-bottom));
  left: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}
.reel-foot p { color: rgb(247 235 218 / 80%); font-size: 13px; }
@media (prefers-reduced-motion: reduce) {
  .deck, .carousel { scroll-behavior: auto; }
  .dots button, .rail-btn { transition: none; }
  .rail-btn { animation: none; }
  .rail-btn:active { transform: none; }
}
</style>
