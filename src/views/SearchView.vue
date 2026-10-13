<script setup lang="ts">
import { ref, watch } from 'vue'
import { listExplore } from '@/api/lattae'
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

const query = ref('')
const items = ref<ExploreItem[]>([])
const ready = ref(false)

async function load() {
  const rows = await listExplore(query.value)
  items.value = rows.flatMap((row) => {
    const post: ExploreItem = {
      key: `post-${row.id}`,
      kind: 'post',
      name: row.name,
      to: `/reels/${row.reelId}?kind=post`,
      changePct: row.changePct,
      text: row.summary ?? UNKNOWN_LINE,
    }
    const reel: ExploreItem = {
      key: `reel-${row.reelId}`,
      kind: 'reel',
      name: row.name,
      to: `/reels/${row.reelId}?kind=reel`,
      changePct: row.changePct,
      text: row.reel.title,
    }
    return [post, reel]
  })
  ready.value = true
}

watch(query, load, { immediate: true })
</script>

<template>
  <div class="view">
    <header class="bar">
      <label class="finder">
        <Icon name="search" />
        <span class="sr-only">게시물, 릴스 검색</span>
        <input v-model="query" type="search" placeholder="종목, 별칭, 코드" autocomplete="off" />
      </label>
    </header>
    <p v-if="!ready" class="note pad" role="status">불러오는 중</p>
    <p v-else-if="!items.length" class="note pad" role="status">
      {{ query.trim() ? '해당하는 게시물이나 릴스가 없습니다.' : '표시할 게시물이나 릴스가 없습니다.' }}
    </p>
    <div v-else class="grid">
      <RouterLink
        v-for="(item, index) in items"
        :key="item.key"
        class="cell in"
        :style="{ '--i': index }"
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
  </div>
</template>

<style scoped>
.pad { padding: 0 16px; }
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
</style>
