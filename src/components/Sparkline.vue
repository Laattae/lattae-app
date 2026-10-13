<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  values: number[]
}>()

const points = computed(() => {
  const values = props.values
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 78 + 1
      const y = 30 - ((value - min) / span) * 26
      return `${x},${y}`
    })
    .join(' ')
})
</script>

<template>
  <svg class="spark" viewBox="0 0 80 32" role="img" aria-label="최근 5영업일 종가">
    <polyline :points="points" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.spark {
  width: 80px;
  height: 32px;
  color: var(--text);
}
</style>
