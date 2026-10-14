<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPortfolio, savePortfolio, searchCatalog, searchStocks } from '@/api/lattae'
import BrewStatus from '@/components/BrewStatus.vue'
import ChangePct from '@/components/ChangePct.vue'
import ConnectionMap from '@/components/ConnectionMap.vue'
import Icon from '@/components/Icon.vue'
import type { CatalogHit, Stock } from '@/types'

interface DraftHolding {
  code: string
  name: string
  weight: number
}

const router = useRouter()
const query = ref('')
const results = ref<Stock[]>([])
const holdings = ref<DraftHolding[]>([])
const catalog = ref<CatalogHit[]>([])
const keywords = ref<string[]>([])
const notificationsEnabled = ref(false)
const ready = ref(false)
const failed = ref(false)
const error = ref('')
const saved = ref(false)

const total = computed(() =>
  holdings.value.reduce((sum, item) => sum + (Number(item.weight) || 0), 0),
)

function changeOf(code: string) {
  return catalog.value.find((item) => item.code === code)?.changePct ?? 0
}

function connected(code: string) {
  return holdings.value.some((item) => item.code === code)
}

async function load() {
  failed.value = false
  try {
    const portfolio = await getPortfolio()
    if (!portfolio) return
    notificationsEnabled.value = portfolio.notificationsEnabled
    keywords.value = [...portfolio.keywords]
    catalog.value = await searchCatalog('')
    holdings.value = portfolio.holdings.flatMap((holding) => {
      const hit = catalog.value.find((item) => item.code === holding.code)
      return hit ? [{ code: hit.code, name: hit.name, weight: holding.weight }] : []
    })
  } catch {
    failed.value = true
  } finally {
    ready.value = true
  }
}

async function search() {
  saved.value = false
  results.value = await searchStocks(query.value)
}

function connect(stock: Stock) {
  saved.value = false
  error.value = ''
  if (connected(stock.code)) return
  holdings.value.push({ code: stock.code, name: stock.name, weight: 10 })
  query.value = ''
  results.value = []
}

function disconnect(code: string) {
  saved.value = false
  error.value = ''
  holdings.value = holdings.value.filter((item) => item.code !== code)
}

async function save() {
  error.value = ''
  saved.value = false
  if (!holdings.value.length) {
    error.value = '종목을 하나 이상 연결해 주세요.'
    return
  }
  if (holdings.value.some((item) => !item.weight || item.weight <= 0)) {
    error.value = '비중은 0보다 큰 숫자로 입력해 주세요.'
    return
  }
  if (total.value > 100) {
    error.value = '비중 합이 100%를 넘습니다. 합을 100 이하로 맞춰 주세요.'
    return
  }
  await savePortfolio({
    holdings: holdings.value.map((item) => ({ code: item.code, weight: Number(item.weight) })),
    keywords: keywords.value,
    notificationsEnabled: notificationsEnabled.value,
  })
  saved.value = true
}

onMounted(load)
</script>

<template>
  <div class="view">
    <header class="bar">
      <button type="button" class="icon-btn" aria-label="뒤로" @click="router.back()">
        <Icon name="back" />
      </button>
      <h1>종목 연결</h1>
    </header>
    <BrewStatus v-if="!ready" kind="roast" />
    <p v-else-if="failed" class="note pad" role="alert">
      정보를 불러오지 못했습니다.
      <button type="button" class="text-btn" @click="load">다시 시도</button>
    </p>
    <form v-else class="stack cascade" @submit.prevent="save">
      <section>
        <p class="note">계좌는 연결하지 않습니다. 이름이나 별칭으로 종목을 찾아 연결합니다.</p>
        <label class="field">
          <span class="sr-only">종목</span>
          <input
            v-model="query"
            type="search"
            placeholder="이름, 별칭, 종목코드"
            autocomplete="off"
            @input="search"
          />
        </label>
        <ul v-if="results.length" class="results">
          <li v-for="stock in results" :key="stock.code">
            <span>
              {{ stock.name }}
              <small>{{ stock.code }}</small>
            </span>
            <button type="button" :disabled="connected(stock.code)" @click="connect(stock)">
              {{ connected(stock.code) ? '연결됨' : '연결' }}
            </button>
          </li>
        </ul>
        <p v-else-if="query.trim()" class="note" role="status">해당하는 종목이 없습니다.</p>
      </section>

      <ConnectionMap
        v-if="holdings.length"
        heading="h2"
        layout="row"
        note="이 기기에 적어 둔 종목입니다."
        :items="holdings.map((item) => ({ key: item.code, label: item.name }))"
      />

      <section>
        <h2>연결된 종목</h2>
        <p v-if="!holdings.length" class="note">연결된 종목이 없습니다.</p>
        <TransitionGroup name="list" tag="ul" class="holdings">
          <li v-for="holding in holdings" :key="holding.code">
            <div class="who">
              <strong>{{ holding.name }}</strong>
              <small>{{ holding.code }}</small>
            </div>
            <ChangePct :value="changeOf(holding.code)" />
            <label>
              <span class="sr-only">{{ holding.name }} 비중</span>
              <input v-model.number="holding.weight" class="num" type="number" min="1" max="100" inputmode="numeric" @input="saved = false" />
              <span>%</span>
            </label>
            <button type="button" @click="disconnect(holding.code)">해제</button>
          </li>
        </TransitionGroup>
        <p class="note num">
          비중 합 {{ total }}%
          <template v-if="total < 100"> · 남은 {{ 100 - total }}%</template>
        </p>
      </section>

      <section>
        <h2>관심 키워드</h2>
        <p v-if="!keywords.length" class="note">선택한 키워드가 없습니다.</p>
        <ul v-else class="chips">
          <li v-for="keyword in keywords" :key="keyword">{{ keyword }}</li>
        </ul>
      </section>

      <Transition name="soft">
        <p v-if="error" class="error" role="alert">{{ error }}</p>
      </Transition>
      <Transition name="soft">
        <p v-if="saved" class="note" role="status">연결을 저장했습니다.</p>
      </Transition>
      <button type="submit" class="primary">연결 저장</button>
    </form>
  </div>
</template>

<style scoped>
.pad { padding: 0 16px; }
h2 { margin: 0; font-size: 15px; }
.results, .holdings, .chips { position: relative; margin: 0; padding: 0; list-style: none; }
.results li, .holdings li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 52px;
  border-bottom: 1px solid var(--line);
}
.who { min-width: 0; flex: 1; }
strong, small, .note { display: block; }
small { color: var(--muted); font-size: 12px; }
.holdings label { display: flex; align-items: center; gap: 4px; }
.holdings input {
  width: 64px;
  min-height: 40px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg-raised);
}
.results button, .holdings button[type='button'] {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
}
.results button:disabled { opacity: 0.55; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chips li {
  min-height: 32px;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
}
.primary { width: 100%; }
.error { margin: 0; font-weight: 700; }
</style>
