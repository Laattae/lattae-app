<script setup lang="ts">
import CauseBadge from './CauseBadge.vue'
import ChangePct from './ChangePct.vue'
import { UNKNOWN_LINE } from '@/lib/format'
import type { MoveView } from '@/types'

defineProps<{
  move: MoveView
}>()
</script>

<template>
  <RouterLink
    class="post"
    :data-scope="move.scope ?? 'unknown'"
    :to="`/moves/${move.id}`"
  >
    <div class="top">
      <span class="avatar" aria-hidden="true">{{ move.name.slice(0, 2) }}</span>
      <div class="who">
        <h2>{{ move.name }}</h2>
        <p class="meta">
          <span v-if="move.weight !== null">비중 {{ move.weight }}%</span>
          <span v-else>관심</span>
          <span>{{ move.sources.length ? `근거 ${move.sources.length}건` : '근거 없음' }}</span>
        </p>
      </div>
      <CauseBadge :cause="move.causeType" :scope="move.scope" />
    </div>
    <ChangePct :value="move.changePct" size="lg" />
    <p class="summary">{{ move.summary ?? UNKNOWN_LINE }}</p>
  </RouterLink>
</template>

<style scoped>
.post {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 18px;
  border-bottom: 1px solid var(--line);
  background: var(--bg);
  text-decoration: none;
}

.post[data-scope='stock'] {
  box-shadow: inset 3px 0 0 var(--text);
}

.post[data-scope='theme'] {
  box-shadow: inset 3px 0 0 var(--accent), inset 6px 0 0 var(--bg), inset 8px 0 0 var(--accent);
}

.post[data-scope='market'] {
  box-shadow: inset 3px 0 0 var(--muted);
}

.top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.top :deep(.badges) {
  justify-content: flex-end;
  max-width: 46%;
}

.avatar {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--bg-raised);
  font-size: 12px;
  font-weight: 700;
}

.who {
  min-width: 0;
  flex: 1;
}

h2,
.summary,
.meta {
  margin: 0;
}

h2 {
  overflow: hidden;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary {
  line-height: 1.5;
}

.meta {
  display: flex;
  gap: 8px;
  color: var(--muted);
  font-size: 12px;
}
</style>
