<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    kind: 'espresso' | 'roast' | 'latte'
    tone?: 'light' | 'dark'
    motion?: boolean
    size?: number
  }>(),
  { tone: 'light', motion: false, size: 88 },
)

const src = computed(() => {
  if (props.kind === 'latte') {
    return props.tone === 'dark'
      ? '/transparent/lattae-transparent-ondark.svg'
      : '/transparent/lattae-transparent.svg'
  }
  const tone = props.tone === 'dark' ? '-ondark' : ''
  return `/transparent/lattae-${props.kind}-transparent${tone}.svg`
})
</script>

<template>
  <span
    class="brew"
    :data-kind="kind"
    :data-motion="motion ? 'on' : 'off'"
    :style="{ '--brew': `${size}px` }"
    aria-hidden="true"
  >
    <img :src="src" alt="" />
  </span>
</template>

<style scoped>
.brew {
  display: block;
  width: var(--brew, 88px);
  height: var(--brew, 88px);
  flex: 0 0 auto;
}

.brew img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brew[data-motion='on'][data-kind='espresso'] img {
  animation: shot 0.85s var(--ease-out) infinite;
}

.brew[data-motion='on'][data-kind='roast'] img {
  animation: tumble 2.8s ease-in-out infinite;
}

.brew[data-motion='on'][data-kind='latte'] img {
  animation: steam 2s ease-in-out infinite;
}

@keyframes shot {
  0% { transform: translateY(-10%); }
  46%, 100% { transform: translateY(0); }
}

@keyframes tumble {
  0%, 100% { transform: rotate(-2.5deg); }
  50% { transform: rotate(2.5deg); }
}

@keyframes steam {
  0%, 100% { transform: translateY(5%); }
  50% { transform: translateY(-5%); }
}

@media (prefers-reduced-motion: reduce) {
  .brew img { animation: none; }
}
</style>
