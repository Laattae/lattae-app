<script setup lang="ts">
import BrewMark from './BrewMark.vue'

withDefaults(
  defineProps<{
    heading?: 'h2' | 'h3'
    layout?: 'stack' | 'row'
    note?: string
    hub?: string
    items: { key: string; label: string; to?: string | null }[]
  }>(),
  { heading: 'h3', layout: 'stack' },
)
</script>

<template>
  <section class="map" :data-layout="layout" aria-label="연결 지도">
    <header>
      <BrewMark kind="roast" :size="44" />
      <component :is="heading">연결 지도</component>
    </header>
    <p v-if="note" class="note">{{ note }}</p>
    <ol>
      <li v-if="hub" class="hub">{{ hub }}</li>
      <li v-for="item in items" :key="item.key">
        <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
        <span v-else>{{ item.label }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.map header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.map :is(h2, h3),
.note {
  margin: 0;
}

.map :is(h2, h3) {
  font-size: 15px;
}

.note {
  margin-top: 8px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}

.map ol {
  display: flex;
  flex-direction: column;
  margin: 10px 0 0;
  padding: 0 0 0 16px;
  list-style: none;
  border-left: 2px solid var(--accent);
}

.map li {
  position: relative;
  padding: 5px 0 5px 12px;
}

.map li::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -21px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  transform: translateY(-50%);
}

.map .hub::before {
  background: var(--text);
}

.map a,
.map span {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--bg);
  text-decoration: none;
}

.map .hub {
  font-weight: 750;
}

.map[data-layout='row'] ol {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 0;
  margin-top: 12px;
  padding: 0;
  border-left: 0;
}

.map[data-layout='row'] li {
  display: inline-flex;
  align-items: center;
  padding: 0;
}

.map[data-layout='row'] li::before {
  display: none;
}

.map[data-layout='row'] li:not(:last-child)::after {
  content: '';
  width: 12px;
  height: 2px;
  margin-inline: 6px;
  border-radius: 999px;
  background: var(--accent);
}
</style>
