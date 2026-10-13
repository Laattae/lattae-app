<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getAlerts, searchCatalog } from '@/api/lattae'
import ChangePct from '@/components/ChangePct.vue'
import Icon from '@/components/Icon.vue'
import type { AlertItem } from '@/types'

const alerts = ref<AlertItem[]>([])
const changes = ref<Record<string, number>>({})
const ready = ref(false)
const failed = ref(false)

const groups = computed(() => {
  const buckets = new Map<string, AlertItem[]>()
  for (const alert of alerts.value) {
    const label = sectionLabel(alert.updatedAt ?? alert.receivedAt)
    const list = buckets.get(label) ?? []
    list.push(alert)
    buckets.set(label, list)
  }
  return [...buckets.entries()].map(([label, items]) => ({ label, items }))
})

function clock(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Seoul',
  }).format(new Date(iso))
}

function seoulDay(iso: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

function sectionLabel(iso: string) {
  const day = seoulDay(iso)
  const today = seoulDay(new Date().toISOString())
  if (day === today) return '오늘'
  const diff = Math.round((Date.parse(today) - Date.parse(day)) / 86400000)
  if (diff === 1) return '어제'
  if (diff > 1 && diff < 7) return '이번 주'
  if (diff >= 7 && diff < 30) return '이번 달'
  return '이전'
}

async function load() {
  failed.value = false
  try {
    const [list, catalog] = await Promise.all([getAlerts(), searchCatalog('')])
    alerts.value = list
    changes.value = Object.fromEntries(catalog.map((item) => [item.code, item.changePct]))
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
    <header class="bar head">
      <RouterLink class="icon-btn" to="/home" aria-label="홈">
        <Icon name="back" />
      </RouterLink>
      <h1>알림</h1>
    </header>
    <p v-if="!ready" class="note pad" role="status">불러오는 중</p>
    <p v-else-if="failed" class="note pad" role="alert">
      알림을 불러오지 못했습니다.
      <button type="button" class="text-btn" @click="load">다시 시도</button>
    </p>
    <p v-else-if="!alerts.length" class="note pad">받은 알림이 없습니다.</p>
    <div v-else>
      <section v-for="group in groups" :key="group.label">
        <h2>{{ group.label }}</h2>
        <ul>
          <li v-for="(alert, index) in group.items" :key="alert.id" class="in" :style="{ '--i': index }">
            <RouterLink class="row" :to="`/moves/${alert.moveId}`">
              <span class="avatar" aria-hidden="true">{{ alert.name.slice(0, 2) }}</span>
              <span class="copy">
                <span class="line">
                  <strong>{{ alert.name }}</strong>
                  {{ alert.text }}
                </span>
                <span class="when">
                  <template v-if="alert.earlierStatus === 'unknown'">
                    <time :datetime="alert.receivedAt">{{ clock(alert.receivedAt) }}</time>
                    원인 미확인
                    <span aria-hidden="true"> · </span>
                  </template>
                  <time :datetime="alert.updatedAt ?? alert.receivedAt">
                    {{ clock(alert.updatedAt ?? alert.receivedAt) }}
                  </time>
                  {{ alert.status === 'confirmed' ? '원인 확인됨' : '원인 미확인' }}
                </span>
              </span>
              <span v-if="changes[alert.code] !== undefined" class="thumb">
                <ChangePct :value="changes[alert.code] ?? 0" />
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.head { border-bottom: 1px solid var(--line); }
.pad { padding: 0 16px; }
h2 {
  margin: 0;
  padding: 14px 16px 6px;
  font-size: 15px;
}
ul { margin: 0; padding: 0; list-style: none; }
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 10px 16px;
  color: inherit;
  text-decoration: none;
}
.row + .row { box-shadow: inset 0 1px 0 var(--line); }
.avatar {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--bg-raised);
  font-size: 13px;
  font-weight: 700;
}
.copy { min-width: 0; flex: 1; }
.line, .when { display: block; }
.line { line-height: 1.4; }
.when { margin-top: 2px; color: var(--muted); font-size: 12px; }
.thumb {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  background: var(--bg-raised);
  font-size: 11px;
  text-align: center;
}
</style>
