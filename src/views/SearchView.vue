<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { listExplorePage, type ExplorePage } from '@/api/lattae'
import BrewMark from '@/components/BrewMark.vue'
import BrewStatus from '@/components/BrewStatus.vue'
import ChangePct from '@/components/ChangePct.vue'
import Icon from '@/components/Icon.vue'
import { UNKNOWN_LINE } from '@/lib/format'

interface ExploreItem {
  key: string
  kind: 'post' | 'reel'
  name: string
  to: string
  changePct: number
  text: string
}

interface Sheet {
  key: string
  label: string
  first: boolean
  items: ExploreItem[]
}

const PAGE_SIZE = 12
const MAX_CYCLES = 8

const query = ref('')
const sheets = ref<Sheet[]>([])
const ready = ref(false)
const scroller = ref<HTMLElement | null>(null)
const sentinel = ref<HTMLElement | null>(null)

let requestId = 0
let loading = false
let cycle = 1
let page = 0
let total = 0
let observer: IntersectionObserver | undefined

function tiles(result: ExplorePage, round: number): ExploreItem[] {
  return result.items.map((row) => ({
    key: `${round}-${result.page}-${row.kind}-${row.kind === 'reel' ? row.reelId : row.id}`,
    kind: row.kind,
    name: row.name,
    to: `/reels/${row.reelId}?kind=${row.kind}`,
    changePct: row.changePct,
    text: row.kind === 'reel' ? row.reel.title : (row.summary ?? UNKNOWN_LINE),
  }))
}

function observe() {
  observer?.disconnect()
  const root = scroller.value
  const target = sentinel.value
  if (!root || !target) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void more()
    },
    { root, rootMargin: '160px 0px' },
  )
  observer.observe(target)
}

async function more() {
  if (loading) return
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  let nextPage = page + 1
  let nextCycle = cycle
  if (total > 0 && nextPage > pageCount) {
    if (cycle >= MAX_CYCLES) return
    nextCycle = cycle + 1
    nextPage = 1
  }
  loading = true
  const id = requestId
  const result = await listExplorePage(query.value, nextPage, PAGE_SIZE)
  if (id !== requestId) return
  total = result.total
  ready.value = true
  if (result.items.length === 0) {
    loading = false
    return
  }
  cycle = nextCycle
  page = result.page
  const index = sheets.value.length + 1
  sheets.value = [
    ...sheets.value,
    {
      key: `${cycle}-${page}`,
      label: `${index}페이지`,
      first: index === 1,
      items: tiles(result, cycle),
    },
  ]
  loading = false
  await nextTick()
  observe()
}

async function load() {
  requestId += 1
  loading = false
  cycle = 1
  page = 0
  total = 0
  sheets.value = []
  ready.value = false
  observer?.disconnect()
  await more()
  await nextTick()
  scroller.value?.scrollTo({ top: 0 })
}

watch(query, () => {
  void load()
}, { immediate: true })

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="scroller" class="view">
    <header class="bar">
      <label class="finder">
        <Icon name="search" />
        <span class="sr-only">게시물, 릴스 검색</span>
        <input v-model="query" type="search" placeholder="종목, 별칭, 코드" autocomplete="off" />
      </label>
    </header>
    <BrewStatus v-if="!ready" kind="roast" />
    <div v-else-if="!sheets.length" class="empty" role="status">
      <BrewMark kind="roast" :size="96" />
      <p class="note">
        {{ query.trim() ? '해당하는 게시물이나 릴스가 없습니다.' : '표시할 게시물이나 릴스가 없습니다.' }}
      </p>
    </div>
    <template v-else>
      <section v-for="sheet in sheets" :key="sheet.key" class="sheet" :aria-label="sheet.label">
        <div class="grid">
          <RouterLink
            v-for="(item, index) in sheet.items"
            :key="item.key"
            class="cell"
            :class="{ in: sheet.first }"
            :style="sheet.first ? { '--i': index } : undefined"
            :data-kind="item.kind"
            :to="item.to"
          >
            <Icon v-if="item.kind === 'reel'" class="mark" name="reels" />
            <span class="sr-only">{{ item.kind === 'reel' ? '릴스' : '게시물' }}</span>
            <h2>{{ item.name }}</h2>
            <ChangePct :value="item.changePct" />
            <p>{{ item.text }}</p>
          </RouterLink>
        </div>
      </section>
      <div ref="sentinel" class="sentinel" aria-hidden="true"></div>
      <p class="sr-only" role="status">{{ sheets.length }}페이지를 표시하는 중</p>
    </template>
  </div>
</template>

<style scoped>
.pad { padding: 0 16px; }
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 24px;
  text-align: center;
}
.finder {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  background: var(--bg-raised);
  color: var(--muted);
}
.finder input {
  flex: 1;
  min-width: 0;
  min-height: 40px;
  border: 0;
  background: transparent;
  color: var(--text);
}
.finder input:focus { outline: none; }
.finder:focus-within { outline: 2px solid var(--text); outline-offset: 2px; }
.view {
  scroll-snap-type: y proximity;
}
.sheet {
  scroll-snap-align: start;
  scroll-margin-top: var(--header-h);
}
.sentinel { height: 1px; }
.grid {
  --peek: 0.22;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(112px, calc((100dvh - var(--header-h) - var(--tab-h) - 6px) / (4 + var(--peek))));
  gap: 2px;
}
.cell {
  position: relative;
  display: flex;
  min-height: 0;
  flex-direction: column;
  justify-content: flex-start;
  gap: 4px;
  padding: 8px;
  overflow: hidden;
  background: var(--bg-raised);
  color: inherit;
  text-decoration: none;
}
.cell[data-kind='reel'] {
  background: var(--canvas);
}
.mark {
  position: absolute;
  top: 8px;
  right: 8px;
}
.cell[data-kind='reel'] h2 {
  padding-right: 22px;
}
h2, p { margin: 0; }
h2 { font-size: 13px; line-height: 1.3; }
p {
  display: -webkit-box;
  overflow: hidden;
  color: var(--muted);
  font-size: 12px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
@media (prefers-reduced-motion: reduce) {
  .view { scroll-snap-type: none; }
}
</style>
