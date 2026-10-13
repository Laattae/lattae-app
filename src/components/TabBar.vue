<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Icon from './Icon.vue'

const route = useRoute()
const tabs = [
  { to: '/home', name: 'home', label: '홈', icon: 'home' },
  { to: '/search', name: 'search', label: '검색', icon: 'search' },
  { to: '/me', name: 'profile', label: '내 정보', icon: 'user' },
] as const
const compact = computed(() => route.name === 'reels')
const current = computed(() => tabs.findIndex((tab) => tab.name === route.name))
</script>

<template>
  <nav class="tabs" :class="{ compact }" aria-label="주요">
    <span
      v-if="current >= 0"
      class="pill"
      :style="{ transform: `translateX(${current * 100}%)` }"
      aria-hidden="true"
    ></span>
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      :aria-label="tab.label"
      :aria-current="route.name === tab.name ? 'page' : undefined"
    >
      <Icon :name="tab.icon" />
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabs {
  position: absolute;
  z-index: 6;
  right: 16px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  left: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 52px;
  padding: 6px;
  border: 1px solid rgb(247 235 218 / 28%);
  border-radius: 999px;
  background: rgb(42 33 28 / 58%);
  box-shadow: 0 10px 28px rgb(42 24 16 / 24%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  transition:
    height 0.42s var(--ease-out),
    left 0.42s var(--ease-out),
    right 0.42s var(--ease-out),
    padding 0.42s var(--ease-out);
}

.pill {
  position: absolute;
  z-index: 0;
  top: 6px;
  bottom: 6px;
  left: 6px;
  width: calc((100% - 12px) / 3);
  border-radius: 999px;
  background: rgb(247 235 218 / 18%);
  transition:
    transform 0.46s var(--ease-out),
    top 0.42s var(--ease-out),
    bottom 0.42s var(--ease-out),
    left 0.42s var(--ease-out),
    width 0.42s var(--ease-out);
}

.tabs.compact .pill {
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / 3);
}

.tabs.compact {
  right: 72px;
  left: 72px;
  height: 46px;
  padding: 4px;
}

a {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border-radius: 999px;
  color: rgb(247 235 218 / 78%);
  font-size: 10px;
  font-weight: 650;
  text-decoration: none;
  transition: transform 0.16s var(--ease-press), color 0.24s var(--ease-out);
}

a:active {
  transform: scale(0.92);
}

a :deep(svg) {
  transition: transform 0.42s var(--ease-out), width 0.42s var(--ease-out), height 0.42s var(--ease-out);
}

a[aria-current='page'] {
  color: #f7ebda;
}

a[aria-current='page'] :deep(svg) {
  transform: scale(1.08);
}

.compact :deep(svg) {
  width: 20px;
  height: 20px;
}

@media (prefers-reduced-motion: reduce) {
  .tabs,
  .pill,
  a,
  a :deep(svg) { transition: none; }
  a:active,
  a[aria-current='page'] :deep(svg) { transform: none; }
}
</style>
