<script setup lang="ts">
import { computed } from 'vue'
import { changeDirection, formatPct, spokenChange } from '@/lib/format'

const props = defineProps<{
  value: number
  size?: 'md' | 'lg'
}>()

const direction = computed(() => changeDirection(props.value))
const arrow = computed(() => (direction.value === 'up' ? '↑' : direction.value === 'down' ? '↓' : '→'))
</script>

<template>
  <span class="chg num" :class="[direction, size ?? 'md']">
    <span class="sr-only">{{ spokenChange(value) }}</span>
    <span aria-hidden="true">{{ arrow }} {{ formatPct(value) }}</span>
  </span>
</template>

<style scoped>
.lg {
  font-size: 2rem;
  font-weight: 650;
  letter-spacing: -0.04em;
}
</style>
