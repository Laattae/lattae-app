<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMoveDetail, postFeedback } from '@/api/lattae'
import BrewMark from '@/components/BrewMark.vue'
import BrewStatus from '@/components/BrewStatus.vue'
import CauseBadge from '@/components/CauseBadge.vue'
import ChangePct from '@/components/ChangePct.vue'
import ConnectionMap from '@/components/ConnectionMap.vue'
import Disclaimer from '@/components/Disclaimer.vue'
import Icon from '@/components/Icon.vue'
import { UNKNOWN_LINE, formatPrice, formatWhen } from '@/lib/format'
import type { MoveView } from '@/types'

const route = useRoute()
const router = useRouter()
const move = ref<MoveView | null>(null)
const ready = ref(false)
const failed = ref(false)

const moveId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const unknown = computed(() => move.value?.causeType === 'unknown')

async function load() {
  ready.value = false
  failed.value = false
  try {
    move.value = await getMoveDetail(moveId.value)
  } catch {
    failed.value = true
  } finally {
    ready.value = true
  }
}

async function vote(next: 'up' | 'down') {
  if (!move.value || unknown.value) return
  await postFeedback(move.value.id, next)
  move.value = { ...move.value, vote: next }
}

watch(moveId, load, { immediate: true })
</script>

<template>
  <div class="view">
    <header class="bar">
      <button type="button" class="icon-btn" aria-label="뒤로" @click="router.back()">
        <Icon name="back" />
      </button>
      <h1>변동</h1>
    </header>

    <BrewStatus v-if="!ready" kind="espresso" />
    <p v-else-if="failed" class="note pad" role="alert">
      변동을 불러오지 못했습니다.
      <button type="button" class="text-btn" @click="load">다시 시도</button>
    </p>
    <p v-else-if="!move" class="note pad">이 변동을 찾지 못했습니다.</p>
    <article v-else class="stack cascade">
      <BrewMark class="shot" kind="espresso" :size="88" />
      <div class="top">
        <h2>{{ move.name }}</h2>
        <CauseBadge :cause="move.causeType" :scope="move.scope" />
      </div>
      <ChangePct :value="move.changePct" size="lg" />
      <p class="price num">{{ formatPrice(move.close) }}</p>
      <p class="note">{{ move.asOfLabel }}입니다. 실시간 시세가 아닙니다.</p>
      <p v-if="move.weight !== null" class="note">비중 {{ move.weight }}%</p>

      <section>
        <h3>원인</h3>
        <p>{{ move.summary ?? UNKNOWN_LINE }}</p>
      </section>

      <section>
        <h3>근거</h3>
        <p v-if="!move.sources.length" class="note">표시할 공시·뉴스가 없습니다.</p>
        <ul v-else class="sources">
          <li v-for="source in move.sources" :key="source.id">
            <a :href="source.url" target="_blank" rel="noopener noreferrer">
              {{ source.title }}
              <span class="sr-only">(새 탭)</span>
            </a>
            <p class="note">{{ source.publisher }} · {{ formatWhen(source.publishedAt) }}</p>
          </li>
        </ul>
      </section>

      <ConnectionMap
        v-if="move.related.length"
        :hub="move.name"
        note="방향이 같다는 뜻입니다. 원인이 같다는 뜻은 아닙니다."
        :items="move.related.map((item) => ({ key: item.code, label: item.name, to: item.moveId ? `/moves/${item.moveId}` : null }))"
      />

      <section v-if="!unknown">
        <h3>원인이 맞았나요?</h3>
        <div class="votes">
          <button type="button" :aria-pressed="move.vote === 'up'" @click="vote('up')">맞아요</button>
          <button type="button" :aria-pressed="move.vote === 'down'" @click="vote('down')">아니에요</button>
        </div>
        <Transition name="soft">
          <p v-if="move.vote" class="note" role="status">의견을 기록했습니다.</p>
        </Transition>
      </section>

      <RouterLink class="primary link" :to="`/reels/${move.reelId}?kind=post`">
        {{ unknown ? '이 상태 이해하기' : '이 이유 이해하기' }}
      </RouterLink>
    </article>
    <Disclaimer />
  </div>
</template>

<style scoped>
.pad { padding: 0 16px; }
.shot { margin-inline: auto; }
h2, h3, p { margin: 0; }
h2 { font-size: 1.4rem; }
.top { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
.price { font-size: 1.05rem; }
.sources { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
.sources a { text-decoration: underline; text-underline-offset: 2px; }
.chips, .votes { display: flex; flex-wrap: wrap; gap: 8px; }
.chips a, .chips span, .votes button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  text-decoration: none;
}
.votes button[aria-pressed='true'] { background: var(--accent); color: #4a2c1d; border-color: var(--accent); }
.link { display: grid; place-items: center; text-decoration: none; }
</style>
