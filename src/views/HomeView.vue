<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getMoves, getPortfolio, getWatchGrid } from '@/api/lattae'
import Icon from '@/components/Icon.vue'
import MoveCard from '@/components/MoveCard.vue'
import ChangePct from '@/components/ChangePct.vue'
import type { MoveView, Tile } from '@/types'

interface Story {
  code: string
  name: string
  changePct: number
  moveId: string | null
  caption: string
}

const moves = ref<MoveView[]>([])
const tiles = ref<Tile[]>([])
const ready = ref(false)
const failed = ref(false)

const stories = computed<Story[]>(() => {
  const sharp: Story[] = moves.value.map((move) => ({
    code: move.code,
    name: move.name,
    changePct: move.changePct,
    moveId: move.id,
    caption: move.weight !== null ? `비중 ${move.weight}%` : '관심',
  }))
  const seen = new Set(sharp.map((story) => story.code))
  const quiet: Story[] = tiles.value
    .filter((tile) => !seen.has(tile.code))
    .map((tile) => ({
      code: tile.code,
      name: tile.name,
      changePct: tile.changePct,
      moveId: null,
      caption: tile.interest ? '관심' : `비중 ${tile.weight}%`,
    }))
  return [...sharp, ...quiet]
})

function mark(name: string) {
  return name.slice(0, 2)
}

async function load() {
  failed.value = false
  ready.value = false
  try {
    const portfolio = await getPortfolio()
    if (!portfolio) return
    moves.value = await getMoves(portfolio)
    tiles.value = await getWatchGrid(portfolio)
  } catch {
    failed.value = true
  } finally {
    ready.value = true
  }
}

onMounted(load)
</script>

<template>
  <div class="view">
    <header class="bar home-bar">
      <div>
        <h1 class="mark">라떼</h1>
        <p class="tagline">Your portfolio, explained.</p>
      </div>
      <span class="grow"></span>
      <RouterLink class="icon-btn" to="/alerts" aria-label="알림">
        <Icon name="bell" />
      </RouterLink>
    </header>

    <p v-if="!ready" class="note pad" role="status">불러오는 중</p>
    <p v-else-if="failed" class="note pad" role="alert">
      홈을 불러오지 못했습니다.
      <button type="button" class="text-btn" @click="load">다시 시도</button>
    </p>
    <template v-else>
      <ul v-if="stories.length" class="stories" aria-label="보유와 관심">
        <li v-for="(story, index) in stories" :key="story.code" class="bloom" :style="{ '--i': index }">
          <RouterLink v-if="story.moveId" class="story" :to="`/moves/${story.moveId}`">
            <span class="ring moved" aria-hidden="true">{{ mark(story.name) }}</span>
            <span class="name">{{ story.name }}</span>
            <ChangePct :value="story.changePct" />
            <span class="sr-only">{{ story.caption }}. 급변</span>
          </RouterLink>
          <article v-else class="story">
            <span class="ring" aria-hidden="true">{{ mark(story.name) }}</span>
            <span class="name">{{ story.name }}</span>
            <ChangePct :value="story.changePct" />
            <span class="sr-only">{{ story.caption }}. 특이 변동 없음</span>
          </article>
        </li>
      </ul>
      <p v-else class="note pad">그 밖에 표시할 종목이 없습니다.</p>
      <p class="note asof">
        가격은 {{ moves[0]?.asOfLabel ?? '전일 종가 기준' }}입니다. 실시간 시세가 아닙니다.
      </p>
      <div class="feed">
        <p v-if="!moves.length" class="note empty">오늘 급변으로 표시할 종목이 없습니다.</p>
        <MoveCard
          v-for="(move, index) in moves"
          :key="move.id"
          class="in"
          :style="{ '--i': index }"
          :move="move"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.home-bar {
  border-bottom: 1px solid var(--line);
}

.stories {
  display: flex;
  gap: 4px;
  margin: 0;
  padding: 12px 8px;
  overflow-x: auto;
  border-bottom: 1px solid var(--line);
  list-style: none;
  scrollbar-width: none;
}

.stories::-webkit-scrollbar {
  display: none;
}

.story {
  display: flex;
  width: 76px;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: inherit;
  font-size: 12px;
  text-align: center;
  text-decoration: none;
}

.ring {
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
  border: 2px solid var(--line);
  border-radius: 50%;
  background: var(--bg-raised);
  font-size: 14px;
  font-weight: 700;
}

.ring.moved {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 2px var(--bg);
}

.name {
  max-width: 72px;
  overflow: hidden;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asof,
.empty,
.pad {
  padding-right: 16px;
  padding-left: 16px;
}

.asof {
  margin: 10px 0;
}

.feed {
  display: flex;
  flex-direction: column;
}
</style>
