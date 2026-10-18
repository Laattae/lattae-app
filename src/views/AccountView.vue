<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAlertCodes, getPortfolio, getSession, savePortfolio, signOut, type AuthProvider } from '@/api/lattae'
import { disablePush, enablePush } from '@/lib/push'
import BrewStatus from '@/components/BrewStatus.vue'
import Icon from '@/components/Icon.vue'

const router = useRouter()
const ready = ref(false)
const failed = ref(false)
const busy = ref(false)
const asking = ref(false)
const provider = ref<AuthProvider | null>(null)
const notificationsEnabled = ref(false)
const note = ref('')

const providerLabel: Record<AuthProvider, string> = {
  kakao: '카카오',
  google: '구글',
  apple: '애플',
}

const loginLabel = computed(() =>
  provider.value ? `${providerLabel[provider.value]}로 로그인되어 있습니다.` : '로그인되어 있습니다.',
)

async function load() {
  failed.value = false
  try {
    provider.value = await getSession()
    const portfolio = await getPortfolio()
    notificationsEnabled.value = portfolio?.notificationsEnabled ?? false
    note.value = notificationsEnabled.value
      ? '알림을 받습니다. 급변 설명만 보냅니다.'
      : '알림함에서 확인합니다.'
  } catch {
    failed.value = true
  } finally {
    ready.value = true
  }
}

async function persist(enabled: boolean) {
  const portfolio = await getPortfolio()
  if (!portfolio) return
  await savePortfolio({
    holdings: portfolio.holdings,
    keywords: portfolio.keywords,
    notificationsEnabled: enabled,
  })
  notificationsEnabled.value = enabled
}

async function toggleNotifications() {
  if (busy.value) return
  busy.value = true
  note.value = ''
  try {
    if (notificationsEnabled.value) {
      await disablePush().catch((error) => console.warn('[push] disable failed', error))
      await persist(false)
      note.value = '알림을 받지 않습니다. 알림함은 그대로 볼 수 있습니다.'
      return
    }
    if (!('Notification' in window)) {
      await persist(false)
      note.value = '이 브라우저는 알림을 지원하지 않습니다. 알림함은 그대로 볼 수 있습니다.'
      return
    }
    const result = await Notification.requestPermission()
    const enabled = result === 'granted'
    if (enabled) {
      const portfolio = await getPortfolio()
      await enablePush(portfolio ? await getAlertCodes(portfolio) : [])
    }
    await persist(enabled)
    note.value = enabled
      ? '알림을 받습니다. 급변 설명만 보냅니다.'
      : '알림을 받지 않습니다. 알림함은 그대로 볼 수 있습니다.'
  } catch (error) {
    console.warn('[push] toggle failed', error)
    note.value = '알림 설정을 저장하지 못했습니다.'
  } finally {
    busy.value = false
  }
}

onMounted(load)

async function logout() {
  await signOut()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <div class="view">
    <header class="bar">
      <button type="button" class="icon-btn" aria-label="뒤로" @click="router.back()">
        <Icon name="back" />
      </button>
      <h1>계정 설정</h1>
    </header>
    <BrewStatus v-if="!ready" kind="latte" />
    <p v-else-if="failed" class="note pad" role="alert">
      정보를 불러오지 못했습니다.
      <button type="button" class="text-btn" @click="load">다시 시도</button>
    </p>
    <div v-else class="board">
      <section class="card" aria-labelledby="login-title">
        <h2 id="login-title">로그인</h2>
        <p>{{ loginLabel }}</p>
        <p class="note">계정은 이 기기에만 기억합니다. 계좌는 연결하지 않습니다.</p>
      </section>

      <section class="card" aria-labelledby="push-title">
        <div class="line">
          <h2 id="push-title">알림</h2>
          <button
            type="button"
            class="switch"
            role="switch"
            :aria-checked="notificationsEnabled"
            :aria-label="notificationsEnabled ? '알림 끄기' : '알림 켜기'"
            :disabled="busy"
            @click="toggleNotifications"
          />
        </div>
        <p class="note" role="status">{{ note }}</p>
        <p class="note">iPhone에서는 홈 화면에 추가한 뒤에만 푸시 알림을 받을 수 있습니다.</p>
      </section>

      <section v-if="asking" class="card ask" role="region" aria-label="로그아웃 확인">
        <p class="ask-title">이 기기에서 로그아웃할까요?</p>
        <p class="note">로그인 상태만 지웁니다. 연결한 종목은 이 기기에 남습니다.</p>
        <div class="ask-actions">
          <button type="button" class="ghost" @click="asking = false">취소</button>
          <button type="button" class="primary" @click="logout">로그아웃</button>
        </div>
      </section>
      <button v-else type="button" class="leave" @click="asking = true">로그아웃</button>
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
  padding: 16px;
  border-radius: 18px;
  background: var(--bg-raised);
  box-shadow: 0 8px 24px rgb(74 44 29 / 8%);
}

h2 {
  margin: 0;
  font-size: 15px;
}

.card p {
  margin: 8px 0 0;
}

.line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.switch {
  position: relative;
  width: 48px;
  height: 28px;
  flex: none;
  border-radius: 999px;
  background: var(--line);
}

.switch[aria-checked='true'] {
  background: var(--accent);
}

.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s var(--ease-out);
}

.switch[aria-checked='true']::after {
  transform: translateX(20px);
}

.switch:disabled {
  opacity: 0.55;
}

.leave {
  align-self: center;
  min-height: 40px;
  margin-top: 4px;
  padding: 8px 4px;
  color: #9a9a9a;
  font-size: 14px;
}

.ask-title {
  margin: 0;
}

.ask .note {
  margin-top: 6px;
}

.ask-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.ask-actions .ghost,
.ask-actions .primary {
  flex: 1;
}

.ghost {
  border: 1px solid var(--line);
  background: transparent;
}
</style>
