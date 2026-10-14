<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getPortfolio, getSession, type AuthProvider } from '@/api/lattae'

const ready = ref(false)
const failed = ref(false)
const provider = ref<AuthProvider | null>(null)
const holdingCount = ref(0)
const keywordCount = ref(0)

const providerLabel: Record<AuthProvider, string> = {
  kakao: '카카오',
  google: '구글',
  apple: '애플',
}

const accountName = computed(() =>
  provider.value ? `${providerLabel[provider.value]} 계정` : '로그인된 계정',
)

const holdingAside = computed(() => {
  const stocks = `${holdingCount.value}종목`
  const keywords = keywordCount.value ? ` · 키워드 ${keywordCount.value}개` : ''
  return `${stocks}${keywords}`
})

async function load() {
  failed.value = false
  try {
    provider.value = await getSession()
    const portfolio = await getPortfolio()
    holdingCount.value = portfolio?.holdings.length ?? 0
    keywordCount.value = portfolio?.keywords.length ?? 0
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
    <header class="bar">
      <h1>내 정보</h1>
    </header>
    <p v-if="!ready" class="note pad" role="status">불러오는 중</p>
    <p v-else-if="failed" class="note pad" role="alert">
      정보를 불러오지 못했습니다.
      <button type="button" class="text-btn" @click="load">다시 시도</button>
    </p>
    <div v-else class="board">
      <section class="card who" aria-label="계정">
        <span class="badge" :data-provider="provider ?? 'none'" aria-hidden="true">
          <svg v-if="provider === 'kakao' || !provider" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 4.2c-4.6 0-8.3 2.9-8.3 6.5 0 2.3 1.5 4.4 3.8 5.6l-.7 2.9c-.1.4.3.7.6.4l3.3-2.1c.4.1.9.1 1.3.1 4.6 0 8.3-2.9 8.3-6.5S16.6 4.2 12 4.2z"
            />
          </svg>
          <span v-else-if="provider === 'google'">G</span>
          <svg v-else viewBox="0 0 17 20">
            <path
              fill="currentColor"
              d="M13.6 10.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5.1-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7 1.9-1.1 2.7-2.2c.8-1.2 1.2-2.4 1.2-2.5-.1-.1-2.3-.9-2.3-3.6zM11.4 4.2c.6-.7 1-1.8.9-2.8-1 .1-2.1.6-2.8 1.4-.6.7-1.1 1.8-.9 2.8 1.1.1 2.1-.5 2.8-1.4z"
            />
          </svg>
        </span>
        <div>
          <h2>{{ accountName }}</h2>
          <p class="note">이 기기에 로그인되어 있습니다.</p>
        </div>
      </section>

      <section class="card" aria-labelledby="setup-title">
        <h2 id="setup-title" class="label">설정</h2>
        <RouterLink class="row" to="/me/holdings">
          <span>종목 연결</span>
          <span class="aside">{{ holdingAside }}</span>
          <span class="chevron" aria-hidden="true" />
        </RouterLink>
      </section>

      <section class="card" aria-labelledby="account-title">
        <h2 id="account-title" class="label">계정</h2>
        <RouterLink class="row" to="/me/account">
          <span>계정 설정</span>
          <span class="aside">{{ provider ? providerLabel[provider] : '' }}</span>
          <span class="chevron" aria-hidden="true" />
        </RouterLink>
      </section>

      <section class="card" aria-labelledby="info-title">
        <h2 id="info-title" class="label">안내</h2>
        <RouterLink class="row" to="/me/privacy">
          <span>개인정보 처리방침</span>
          <span class="chevron" aria-hidden="true" />
        </RouterLink>
        <RouterLink class="row" to="/me/terms">
          <span>이용약관</span>
          <span class="chevron" aria-hidden="true" />
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<style scoped>
.pad { padding: 0 16px; }

.board {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 12px 16px;
}

.card {
  padding: 6px 0;
  border-radius: 18px;
  background: var(--bg-raised);
  box-shadow: 0 8px 24px rgb(74 44 29 / 8%);
}

.who {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
}

.who h2,
.label {
  margin: 0;
}

.who h2 {
  font-size: 17px;
  letter-spacing: -0.03em;
}

.badge {
  display: grid;
  width: 48px;
  height: 48px;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: #fee500;
  color: #191919;
  font-size: 20px;
  font-weight: 750;
}

.badge[data-provider='google'] {
  border: 1px solid #e4e4e4;
  background: #fff;
  color: #4285f4;
}

.badge[data-provider='apple'] {
  background: #111;
  color: #fff;
}

.badge svg {
  width: 24px;
  height: 24px;
}

.label {
  padding: 10px 16px 2px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 16px;
  text-decoration: none;
}

.row + .row {
  border-top: 1px solid var(--line);
}

.row span:first-child {
  flex: 1;
  font-weight: 650;
}

.aside {
  color: var(--muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.chevron {
  width: 8px;
  height: 8px;
  border-top: 1.7px solid var(--muted);
  border-right: 1.7px solid var(--muted);
  transform: rotate(45deg);
}
</style>
