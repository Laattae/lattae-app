<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  demoPortfolio,
  getPortfolio,
  listKeywords,
  savePortfolio,
  searchStocks,
} from '@/api/lattae'
import Disclaimer from '@/components/Disclaimer.vue'
import type { Portfolio, Stock } from '@/types'

interface DraftHolding {
  code: string
  name: string
  weight: number
}

const router = useRouter()
const query = ref('')
const results = ref<Stock[]>([])
const holdings = ref<DraftHolding[]>([])
const keywords = ref<string[]>([])
const options = listKeywords()
const notificationsEnabled = ref(false)
const pushNote = ref('')
const error = ref('')
const editing = ref(false)

const total = computed(() =>
  holdings.value.reduce((sum, item) => sum + (Number(item.weight) || 0), 0),
)

async function search() {
  results.value = await searchStocks(query.value)
}

function add(stock: Stock) {
  if (holdings.value.some((item) => item.code === stock.code)) return
  holdings.value.push({ code: stock.code, name: stock.name, weight: 10 })
  query.value = ''
  results.value = []
}

function remove(code: string) {
  holdings.value = holdings.value.filter((item) => item.code !== code)
}

function toggleKeyword(keyword: string) {
  keywords.value = keywords.value.includes(keyword)
    ? keywords.value.filter((item) => item !== keyword)
    : [...keywords.value, keyword]
}

async function askPush() {
  if (!('Notification' in window)) {
    notificationsEnabled.value = false
    pushNote.value = '이 브라우저는 알림을 지원하지 않습니다. 알림함은 그대로 볼 수 있습니다.'
    return
  }
  const result = await Notification.requestPermission()
  notificationsEnabled.value = result === 'granted'
  pushNote.value =
    result === 'granted'
      ? '알림을 받습니다. 급변 설명만 보냅니다.'
      : '알림을 받지 않습니다. 알림함은 그대로 볼 수 있습니다.'
}

async function persist(portfolio: Portfolio) {
  await savePortfolio(portfolio)
  await router.push('/home')
}

async function save() {
  error.value = ''
  if (!holdings.value.length) {
    error.value = '종목을 하나 이상 넣어 주세요.'
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
  await persist({
    holdings: holdings.value.map((item) => ({ code: item.code, weight: Number(item.weight) })),
    keywords: keywords.value,
    notificationsEnabled: notificationsEnabled.value,
  })
}

async function useDemo() {
  await persist(demoPortfolio)
}

onMounted(async () => {
  const existing = await getPortfolio()
  if (!existing) return
  editing.value = true
  keywords.value = [...existing.keywords]
  notificationsEnabled.value = existing.notificationsEnabled
  const drafts: DraftHolding[] = []
  for (const holding of existing.holdings) {
    const found = await searchStocks(holding.code)
    const stock = found.find((item) => item.code === holding.code)
    if (stock) drafts.push({ code: stock.code, name: stock.name, weight: holding.weight })
  }
  holdings.value = drafts
})
</script>

<template>
  <div class="view">
    <header class="bar">
      <div>
        <h1 class="mark">라떼</h1>
        <p class="tagline">Your portfolio, explained.</p>
      </div>
      <span class="grow"></span>
      <RouterLink v-if="editing" class="text-btn" to="/home">홈</RouterLink>
    </header>

    <form class="stack cascade" @submit.prevent="save">
      <p class="lead">보유 종목을 알려 주세요. 계좌는 연결하지 않습니다.</p>

      <label class="field">
        <span>종목</span>
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
          <button type="button" @click="add(stock)">
            {{ stock.name }}
            <small>{{ stock.code }}</small>
          </button>
        </li>
      </ul>
      <p v-else-if="query.trim()" class="note" role="status">해당하는 종목이 없습니다.</p>

      <TransitionGroup name="list" tag="ul" class="holdings">
        <li v-for="holding in holdings" :key="holding.code">
          <div>
            <strong>{{ holding.name }}</strong>
            <small>{{ holding.code }}</small>
          </div>
          <label>
            <span class="sr-only">{{ holding.name }} 비중</span>
            <input v-model.number="holding.weight" class="num" type="number" min="1" max="100" inputmode="numeric" />
            <span>%</span>
          </label>
          <button type="button" @click="remove(holding.code)">빼기</button>
        </li>
      </TransitionGroup>
      <p class="note num">
        비중 합 {{ total }}%
        <template v-if="total < 100"> · 남은 {{ 100 - total }}%</template>
      </p>

      <fieldset>
        <legend>관심 키워드</legend>
        <div class="chips">
          <button
            v-for="keyword in options"
            :key="keyword"
            type="button"
            :aria-pressed="keywords.includes(keyword)"
            @click="toggleKeyword(keyword)"
          >
            {{ keyword }}
          </button>
        </div>
      </fieldset>

      <section>
        <h2>알림</h2>
        <p class="note">iPhone에서는 홈 화면에 추가한 뒤에만 푸시 알림을 받을 수 있습니다. 그 전에는 알림함에서 봅니다.</p>
        <button type="button" class="ghost" @click="askPush">알림 허용 요청</button>
        <p v-if="pushNote" class="note" role="status">{{ pushNote }}</p>
      </section>

      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button type="submit" class="primary">저장하고 홈으로</button>
      <button type="button" class="ghost" @click="useDemo">예시로 채워 보기</button>
    </form>
    <Disclaimer />
  </div>
</template>

<style scoped>
.lead {
  margin: 0;
}

.results,
.holdings {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

.results button,
.holdings li {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  text-align: left;
}

.holdings li {
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}

.holdings label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.holdings input {
  width: 64px;
  min-height: 40px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg-raised);
}

small {
  display: block;
  color: var(--muted);
  font-size: 12px;
}

fieldset {
  margin: 0;
  padding: 0;
  border: 0;
}

legend,
h2 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chips button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  transition:
    transform 0.16s var(--ease-press),
    background-color 0.22s var(--ease-out),
    border-color 0.22s var(--ease-out);
}

.chips button[aria-pressed='true'] {
  background: var(--accent);
  border-color: var(--accent);
  color: #4a2c1d;
}

.ghost,
.primary {
  width: 100%;
}

.error {
  margin: 0;
  font-weight: 700;
}
</style>
