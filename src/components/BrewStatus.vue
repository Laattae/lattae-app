<script setup lang="ts">
import BrewMark from './BrewMark.vue'

withDefaults(
  defineProps<{
    kind: 'espresso' | 'roast' | 'latte'
    tone?: 'light' | 'dark'
    label?: string
  }>(),
  { tone: 'light', label: '불러오는 중' },
)
</script>

<template>
  <div class="status" role="status" :data-tone="tone">
    <BrewMark :kind="kind" :tone="tone" motion :size="112" />
    <p>{{ label }}</p>
  </div>
</template>

<style scoped>
.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 16px 8px;
  text-align: center;
}

.status p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.status[data-tone='dark'] p {
  color: rgb(247 235 218 / 82%);
}
</style>
