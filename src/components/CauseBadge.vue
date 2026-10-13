<script setup lang="ts">
import { causeLabel, scopeLabel } from '@/lib/format'
import type { CauseType, MoveScope } from '@/types'

defineProps<{
  cause: CauseType
  scope: MoveScope | null
}>()
</script>

<template>
  <p class="badges">
    <span v-if="cause === 'unknown'" class="badge quiet">원인 미확인</span>
    <template v-else>
      <span v-if="scope" class="badge scope" :data-scope="scope">{{ scopeLabel(scope) }}</span>
      <span v-if="scope !== 'market' && scope !== 'theme'" class="badge">{{ causeLabel(cause) }}</span>
    </template>
  </p>
</template>

<style scoped>
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
}

.badge {
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--accent);
  color: #4a2c1d;
  font-size: 12px;
  font-weight: 700;
}

.quiet {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text);
}

.scope[data-scope='market'] {
  background: transparent;
  border: 1px dashed var(--text);
  color: var(--text);
}

.scope[data-scope='theme'] {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--text);
}

.scope[data-scope='stock'] {
  background: var(--text);
  color: var(--bg);
}
</style>
